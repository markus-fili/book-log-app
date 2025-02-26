import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBVFjRHq8pXSmDTy2vrqzemipHHP_p0dT0",
    authDomain: "book-log-app-3ac73.firebaseapp.com",
    projectId: "book-log-app-3ac73",
    storageBucket: "book-log-app-3ac73.appspot.com",
    messagingSenderId: "146482671526",
    appId: "1:146482671526:web:ba7681e854baa693a9a967",
    measurementId: "G-QVSN8FBFGW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Google API Key (directly included)
const apiKey = "AIzaSyBVFjRHq8pXSmDTy2vrqzemipHHP_p0dT0"; // Replace with your actual API key
let genAI, model;

// Initialize Google Generative AI
async function initializeGenerativeAI() {
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Google Generative AI initialized successfully.");
    } catch (error) {
        console.error("Error initializing Google Generative AI:", error);
    }
}

// Function to ask the ChatBot
async function askChatBot(request) {
    if (!model) {
        console.error("Chatbot model is not initialized.");
        return;
    }
    try {
        const response = await model.generateContent(request);
        console.log("Response from ChatBot:", response);
        appendMessage(response.content);
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

// Chatbot UI Functions
function appendMessage(message) {
    const history = document.createElement("div");
    history.textContent = message;
    history.className = 'history';
    document.getElementById("chat-history").appendChild(history);
    document.getElementById("chat-input").value = ""; // Clear input after sending
}

document.getElementById("send-btn").addEventListener('click', async () => {
    const prompt = document.getElementById("chat-input").value.trim().toLowerCase();
    if (prompt) {
        askChatBot(prompt); // Sends to the Google Generative AI model
    } else {
        appendMessage("Please enter a prompt.");
    }
});

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    const authButtons = document.getElementById("biometric-auth");
    const googleSignInButton = document.getElementById("google-signin");
    const userInfo = document.getElementById("user-info");
    const welcomeMessage = document.getElementById("welcome-message");
    const logoutButton = document.getElementById("logout");
    const notificationArea = document.getElementById("notification-area");
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("books");

    // Ensure the 'ask-ai' button exists before attaching the event listener
    const askAiButton = document.getElementById("ask-ai");
    if (askAiButton) {
        askAiButton.addEventListener("click", async () => {
            const response = await askChatBot("Tell me about book genres.");
            console.log(response);
        });
    } else {
        console.warn("No 'ask-ai' button found.");
    }

    // Notification function
    function showNotification(message, type = "success") {
        const notification = document.createElement("div");
        notification.classList.add("notification", type);
        notification.innerText = message;
        notificationArea.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    function showUserInfo(user) {
        authButtons.style.display = "none";
        googleSignInButton.style.display = "none";
        userInfo.style.display = "block";
        welcomeMessage.innerText = `Welcome, ${user.displayName || "User"}!`;
    }

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            showUserInfo(result.user);
            showNotification(`Signed in as ${result.user.displayName}`);
        } catch (error) {
            showNotification("Google Sign-In failed.", "error");
            console.error(error);
        }
    }

    logoutButton.addEventListener("click", () => {
        auth.signOut().then(() => {
            authButtons.style.display = "block";
            googleSignInButton.style.display = "block";
            userInfo.style.display = "none";
            showNotification("You have been logged out.");
        });
    });

    onAuthStateChanged(auth, (user) => {
        if (user) showUserInfo(user);
        else {
            authButtons.style.display = "block";
            googleSignInButton.style.display = "block";
            userInfo.style.display = "none";
        }
    });

    // Show error message
    function showErrorMessage(message) {
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        errorMessage.innerText = message;
        document.body.appendChild(errorMessage);
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }

    // Fetch books from Firestore
    async function fetchBooks() {
        bookList.innerHTML = "";
        try {
            const querySnapshot = await getDocs(collection(db, "books"));
            querySnapshot.forEach((docSnap) => {
                const book = docSnap.data();
                displayBook(docSnap.id, book.title, book.author, book.genre, book.review);
            });
        } catch (error) {
            showErrorMessage("Error fetching books.");
        }
    }

    // Display a book
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

        bookItem.querySelector(".delete-btn").addEventListener("click", async function () {
            const bookId = this.getAttribute("data-id");
            try {
                await deleteDoc(doc(db, "books", bookId));
                bookItem.classList.add("deleted");
                setTimeout(() => {
                    bookItem.remove();
                    showNotification("Book removed successfully!");
                }, 1000);
            } catch (error) {
                showErrorMessage("Error removing book.");
            }
        });
    }

    // Handle form submission
    bookForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const title = document.getElementById("title").value.trim();
        const author = document.getElementById("author").value.trim();
        const genre = document.getElementById("genre").value.trim();
        const review = document.getElementById("review").value.trim();

        if (title === "" || author === "" || genre === "") {
            showErrorMessage("Please fill in all fields.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "books"), {
                title,
                author,
                genre,
                review
            });

            displayBook(docRef.id, title, author, genre, review);
            showNotification("Book added successfully!");
        } catch (error) {
            showErrorMessage("Error adding book.");
        }

        bookForm.reset();
    });

    // Fetch books on page load
    fetchBooks();

    // Google Sign-In
    googleSignInButton.addEventListener("click", signInWithGoogle);

    // Initialize Google Generative AI
    initializeGenerativeAI();
});
