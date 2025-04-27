const webpush = require("web-push");
const config = require("../config/config");
const emailUtil = require("./emailUtil");
const LoggingUtil = require("./loggingUtil");
const User = require("../models/User");

class NotificationUtil {
  constructor() {
    // Configure web push
    if (config.notifications.providers.push.enabled) {
      webpush.setVapidDetails(
        `mailto:${config.email.from}`,
        config.notifications.providers.push.vapidPublicKey,
        config.notifications.providers.push.vapidPrivateKey
      );
    }
  }

  // Send notification through all enabled channels
  async sendNotification(users, notification) {
    const results = {
      email: [],
      push: [],
      inApp: [],
    };

    const userIds = Array.isArray(users) ? users : [users];
    const userDocs = await User.find({ _id: { $in: userIds } });

    for (const user of userDocs) {
      try {
        // Send email notification if enabled
        if (
          config.notifications.providers.email.enabled &&
          user.notifications?.email?.[notification.type]
        ) {
          const emailResult = await this.sendEmailNotification(
            user,
            notification
          );
          results.email.push({ userId: user._id, success: true });
        }

        // Send push notification if enabled
        if (
          config.notifications.providers.push.enabled &&
          user.notifications?.push?.[notification.type] &&
          user.pushSubscription
        ) {
          const pushResult = await this.sendPushNotification(
            user,
            notification
          );
          results.push.push({ userId: user._id, success: true });
        }

        // Store in-app notification
        const inAppResult = await this.storeInAppNotification(
          user,
          notification
        );
        results.inApp.push({ userId: user._id, success: true });
      } catch (error) {
        LoggingUtil.error("Failed to send notification", error, {
          userId: user._id,
          notification,
        });

        results.email.push({
          userId: user._id,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Send email notification
  async sendEmailNotification(user, notification) {
    const { subject, message, template, data } = notification;

    try {
      if (template) {
        // Use template-based email
        return await emailUtil.sendTemplatedEmail(user.email, template, {
          user,
          ...data,
        });
      } else {
        // Send simple email
        return await emailUtil.sendEmail(user.email, subject, message);
      }
    } catch (error) {
      LoggingUtil.error("Failed to send email notification", error, {
        userId: user._id,
        notification,
      });
      throw error;
    }
  }

  // Send push notification
  async sendPushNotification(user, notification) {
    if (!user.pushSubscription) {
      return;
    }

    const payload = JSON.stringify({
      title: notification.subject,
      body: notification.message,
      icon: notification.icon || "/logo/logo.png",
      data: notification.data,
    });

    try {
      await webpush.sendNotification(user.pushSubscription, payload);
    } catch (error) {
      LoggingUtil.error("Failed to send push notification", error, {
        userId: user._id,
        notification,
      });
      throw error;
    }
  }

  // Store in-app notification
  async storeInAppNotification(user, notification) {
    try {
      const inAppNotification = {
        userId: user._id,
        type: notification.type,
        title: notification.subject,
        message: notification.message,
        data: notification.data,
        read: false,
        createdAt: new Date(),
      };

      // Add to user's notifications array
      await User.findByIdAndUpdate(user._id, {
        $push: {
          inAppNotifications: {
            $each: [inAppNotification],
            $sort: { createdAt: -1 },
            $slice: 50, // Keep only last 50 notifications
          },
        },
      });

      return inAppNotification;
    } catch (error) {
      LoggingUtil.error("Failed to store in-app notification", error, {
        userId: user._id,
        notification,
      });
      throw error;
    }
  }

  // Mark in-app notification as read
  async markNotificationRead(userId, notificationId) {
    try {
      await User.updateOne(
        {
          _id: userId,
          "inAppNotifications._id": notificationId,
        },
        {
          $set: { "inAppNotifications.$.read": true },
        }
      );
    } catch (error) {
      LoggingUtil.error("Failed to mark notification as read", error, {
        userId,
        notificationId,
      });
      throw error;
    }
  }

  // Get unread notifications count
  async getUnreadCount(userId) {
    try {
      const user = await User.findById(userId);
      return user.inAppNotifications.filter((n) => !n.read).length;
    } catch (error) {
      LoggingUtil.error("Failed to get unread notifications count", error, {
        userId,
      });
      throw error;
    }
  }

  // Get recent notifications
  async getRecentNotifications(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      return user.inAppNotifications
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    } catch (error) {
      LoggingUtil.error("Failed to get recent notifications", error, {
        userId,
      });
      throw error;
    }
  }

  // Save push subscription
  async savePushSubscription(userId, subscription) {
    try {
      await User.findByIdAndUpdate(userId, {
        pushSubscription: subscription,
      });
    } catch (error) {
      LoggingUtil.error("Failed to save push subscription", error, {
        userId,
        subscription,
      });
      throw error;
    }
  }

  // Remove push subscription
  async removePushSubscription(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        $unset: { pushSubscription: "" },
      });
    } catch (error) {
      LoggingUtil.error("Failed to remove push subscription", error, {
        userId,
      });
      throw error;
    }
  }
}

// Create singleton instance
const notificationInstance = new NotificationUtil();

module.exports = notificationInstance;
