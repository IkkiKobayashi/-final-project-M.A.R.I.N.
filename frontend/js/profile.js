document.addEventListener("DOMContentLoaded", function () {
  // Profile picture upload functionality
  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePicture = document.getElementById("profilePicture");

  profilePictureInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      // Add loading state
      profilePicture.classList.add("loading");

      const reader = new FileReader();
      reader.onload = function (e) {
        // Remove loading state and update image
        profilePicture.classList.remove("loading");
        profilePicture.src = e.target.result;

        // Add a smooth transition effect
        profilePicture.style.opacity = "0";
        setTimeout(() => {
          profilePicture.style.opacity = "1";
        }, 100);

        // Here you would typically upload the image to your server
        // and update the user's profile picture in the database
      };
      reader.readAsDataURL(file);
    }
  });

  // Load user data from server (mock data for now)
  function loadUserData() {
    // Add loading state to all fields
    const fields = document.querySelectorAll(
      ".editable-field, .non-editable-field"
    );
    fields.forEach((field) => field.classList.add("loading"));

    // Simulate loading delay
    setTimeout(() => {
      // In a real application, you would fetch this data from your server
      const mockUserData = {
        name: "John Doe",
        status: "active",
        role: "Admin",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        department: "Management",
        location: "New York, USA",
        joinedDate: "January 1, 2024",
      };

      // Populate fields with user data
      document.getElementById("profileName").value = mockUserData.name;
      document.getElementById("profileStatus").value = mockUserData.status;
      document.querySelector(".role-value").textContent = mockUserData.role;
      document.getElementById("profileEmail").value = mockUserData.email;
      document.getElementById("profilePhone").value = mockUserData.phone;
      document.getElementById("profileDepartment").value =
        mockUserData.department;
      document.getElementById("profileLocation").value = mockUserData.location;
      document.querySelector(".non-editable-field span").textContent =
        mockUserData.joinedDate;

      // Add initial status class to dropdown
      const statusDropdown = document.getElementById("profileStatus");
      statusDropdown.classList.add("status-active");

      // Remove loading state
      fields.forEach((field) => field.classList.remove("loading"));
    }, 1000);
  }

  // Load user data when the page loads
  loadUserData();
});
