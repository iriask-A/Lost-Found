# KBTU Lost & Found Project

###  Team Members
* **Askarbekova Inkar**
* **Kassym Gulnaz**
* **Beisenbay Dariga**

---

###  Project Description
This is a "Lost & Found" web application built specifically for the **KBTU** campus. The platform allows students and staff to report items found in specific university locations (Canteen, Reading Room, 1st floor, etc.) and helps owners reclaim their lost property. 

The project uses **Django REST Framework** for the backend and **Angular** for the frontend, implementing JWT authentication to ensure only verified users can post or claim items.


###  Technical Plan
* **Models:** Item, Category, Location, and ClaimRequest.
* **Relationships:** ForeignKey links between Items and Categories, and linking every post to the `request.user`.
* **Frontend:** Angular 17+ with Routing, Services for API calls, and JWT Interceptors.
* **Features:** Full CRUD for items, search/filter by location, and a user dashboard for tracking claims.

---

### 📂 Project Structure
* `/frontend` - Angular 17 Application
* `/backend` - Django REST Framework Project
* `/docs` - Postman Collection & PDF Presentation
