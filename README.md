# 🌍 ImpactSync

> **Smart Resource Allocation & Data-Driven Volunteer Coordination**

ImpactSync is a highly responsive, zero-backend web application prototype designed to solve the friction in traditional volunteer coordination. By providing local NGOs, community organizers, and volunteers with a seamless, centralized platform, ImpactSync ensures that human resources are allocated efficiently where they are needed most.

🔗 **[View the Live Demo on GitHub Pages](https://prob2005.github.io/impactsync/)**

---

## ✨ Key Features

This prototype is packed with advanced coordination features, all running flawlessly in the browser without requiring a database connection:

* **👥 Multi-Volunteer Capacity:** Organizers can request multiple volunteers for a single task. The platform tracks available spots and automatically moves the task to "Fully Allocated" once the quota is met.
* **🎭 Demo Role Switcher:** Instantly toggle between "NGO Organizer" and "Volunteer" modes. 
  * *Organizers* can post, edit, and delete community needs.
  * *Volunteers* can claim spots and view their personal impact.
* **📊 Contextual Dashboards:** * View **Global Impact** stats (Total needs posted, community hours) as an Organizer.
  * View **Personal Impact** stats (Tasks claimed by you, your contributed hours) as a Volunteer.
* **🚨 Smart Sorting & Urgent Indicators:** Tasks are automatically sorted chronologically. Events happening within the next 48 hours receive an animated "Urgent" badge to drive immediate action.
* **🔍 Advanced Filtering:** Search for open needs instantly using a dual-filter system (by Category dropdown or by typing Locations/Titles into the smart search bar).
* **🔔 Interactive UI:** Features custom animated toast notifications for user actions and polished empty states for a professional feel.

---

## 🛠️ Tech Stack

Built for maximum speed, accessibility, and zero-cost deployability.

* **Frontend Structure:** HTML5
* **Styling:** Tailwind CSS (via CDN) & FontAwesome Icons
* **Logic & State Management:** Vanilla JavaScript (ES6)
* **Data Persistence:** Browser `localStorage` API
* **Hosting:** GitHub Pages

---

## 🚀 Getting Started (Local Development)

Because ImpactSync uses a zero-backend architecture, running it locally is incredibly simple. No servers, node modules, or database configurations are required.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Prob2005/impactsync.git](https://github.com/Prob2005/impactsync.git)
Navigate to the project directory:

Bash
cd impactsync
Run the app:
Simply double-click the index.html file to open it in any modern web browser. Alternatively, use an extension like VS Code's "Live Server".

💡 How to Use the Prototype
When demonstrating the app, follow this workflow to show off its full capabilities:

Start as an Organizer: Look at the top right corner and ensure the Demo Mode is set to "NGO Organizer".

Post a Need: Fill out the form to request volunteers for an upcoming event. Try setting the date to tomorrow to see the "Urgent" badge appear.

Switch Roles: Change the Demo Mode to "Volunteer". Notice how the posting form is disabled and the dashboard stats change to "My Personal Impact".

Claim a Spot: Click "Claim Spot" on a task. Watch the progress bar fill up and the task move to the "Allocated" board once all spots are taken.

🔮 Future Enhancements
While this version serves as a robust frontend prototype, the architecture is designed to scale. Future iterations will include:

Integration with Firebase/Firestore for real-time cloud data synchronization across multiple devices.

Secure user authentication (Google/Email) with role-based access control.

Geolocation mapping to show volunteer opportunities on an interactive city map.

Built with ❤️ for social impact.

