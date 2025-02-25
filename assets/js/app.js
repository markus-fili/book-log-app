import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBVFjRHq8pXSmDTy2vrqzemipHHP_p0dT0",
    authDomain: "book-log-app-3ac73.firebaseapp.com",
    projectId: "book-log-app-3ac73",
    storageBucket: "book-log-app-3ac73.appspot.com",  // Fixed URL
    messagingSenderId: "146482671526",
    appId: "1:146482671526:web:ba7681e854baa693a9a967",
    measurementId: "G-QVSN8FBFGW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("books");

    // Fetch books from Firestore on page load
    async function fetchBooks() {
        bookList.innerHTML = ""; // Clear the list before adding new items

        const querySnapshot = await getDocs(collection(db, "books"));
        querySnapshot.forEach((docSnap) => {
            const book = docSnap.data();
            displayBook(docSnap.id, book.title, book.author, book.genre, book.review);
        });
    }

    // Function to display a book
    function displayBook(id, title, author, genre, review) {
        const bookItem = document.createElement("li");
        bookItem.classList.add("book-item");
        bookItem.innerHTML = `
            <h3>${title}</h3>
            <p><strong>Author:</strong> ${author}</p>
            <p><strong>Genre:</strong> ${genre}</p>
            <p><strong>Review:</strong> ${review ? review : "No review"}</p>
            <button class="delete-btn" data-id="${id}">Remove</button>
        `;

        bookList.appendChild(bookItem);

        // Delete Book
        bookItem.querySelector(".delete-btn").addEventListener("click", async function () {
            const bookId = this.getAttribute("data-id");

            try {
                await deleteDoc(doc(db, "books", bookId));
                bookItem.remove();
                console.log("Book removed successfully");
            } catch (error) {
                console.error("Error removing book:", error);
            }
        });
    }

    // Handle form submission
    bookForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Get form values
        const title = document.getElementById("title").value.trim();
        const author = document.getElementById("author").value.trim();
        const genre = document.getElementById("genre").value.trim();
        const review = document.getElementById("review").value.trim();

        // Validate input
        if (title === "" || author === "" || genre === "") {
            alert("Please fill in all fields.");
            return;
        }

        try {
            // Save book to Firestore
            const docRef = await addDoc(collection(db, "books"), {
                title,
                author,
                genre,
                review
            });

            displayBook(docRef.id, title, author, genre, review);
            console.log("Book added successfully:", docRef.id);
        } catch (error) {
            console.error("Error adding book:", error);
        }

        // Clear form
        bookForm.reset();
    });

    // Fetch books when the page loads
    fetchBooks();
});
