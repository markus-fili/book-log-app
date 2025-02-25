import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const authButtons = document.getElementById("biometric-auth");
    const googleSignInButton = document.getElementById("google-signin");
    const userInfo = document.getElementById("user-info");
    const welcomeMessage = document.getElementById("welcome-message");
    const logoutButton = document.getElementById("logout");
    const notificationArea = document.getElementById("notification-area");
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("books");

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

    // Function to show error message
    function showErrorMessage(message) {
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        errorMessage.innerText = message;

        // Add to the page
        document.body.appendChild(errorMessage);

        // Hide after 3 seconds
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }

    // Fetch books from Firestore on page load
    async function fetchBooks() {
        bookList.innerHTML = ""; // Clear the list before adding new items

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

        // Highlight the new book for a few seconds
        bookItem.classList.add("highlight");
        setTimeout(() => {
            bookItem.classList.remove("highlight");
        }, 2000);

        // Delete Book
        bookItem.querySelector(".delete-btn").addEventListener("click", async function () {
            const bookId = this.getAttribute("data-id");

            try {
                await deleteDoc(doc(db, "books", bookId));
                // Show feedback for deletion
                bookItem.classList.add("deleted");
                setTimeout(() => {
                    bookItem.remove();
                    showNotification("Book removed successfully!");
                }, 1000);  // Delay removal for visual effect
            } catch (error) {
                showErrorMessage("Error removing book.");
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
            showErrorMessage("Please fill in all fields.");
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
            showNotification("Book added successfully!");
        } catch (error) {
            showErrorMessage("Error adding book.");
        }

        // Clear form
        bookForm.reset();
    });

    // Biometric Registration (Fingerprint/Face recognition)
    async function registerBiometric() {
        if (!('credentials' in navigator)) {
            showErrorMessage("Biometric authentication is not supported on this device.");
            return;
        }

        const publicKeyCredentialCreationOptions = {
            challenge: new Uint8Array([/* Random challenge bytes */]),
            rp: { name: "Book Log App" },
            user: {
                id: new TextEncoder().encode("user_id"),
                name: "username",
                displayName: "Username"
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }]
        };

        try {
            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            });
            console.log("Biometric registration successful:", credential);
            // Save the credential (public key) to your server or Firebase for future authentication
        } catch (error) {
            showErrorMessage("Biometric registration failed.");
            console.error("Error during biometric registration:", error);
        }
    }

    // Biometric Authentication (Login using Fingerprint/Face recognition)
    async function authenticateBiometric() {
        if (!('credentials' in navigator)) {
            showErrorMessage("Biometric authentication is not supported on this device.");
            return;
        }

        const publicKeyCredentialRequestOptions = {
            challenge: new Uint8Array([/* Random challenge bytes */]),
            rpId: "your-website.com",
            allowCredentials: [{
                id: new TextEncoder().encode("stored-public-key-id"),
                type: "public-key"
            }]
        };

        try {
            const assertion = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions
            });

            console.log("Biometric authentication successful:", assertion);
            // After successful authentication, sign in the user using Firebase Auth
        } catch (error) {
            showErrorMessage("Biometric authentication failed.");
            console.error("Error during biometric authentication:", error);
        }
    }

    // Set up login and registration button handlers
    document.getElementById("register-biometric").addEventListener("click", registerBiometric);
    document.getElementById("login-biometric").addEventListener("click", authenticateBiometric);

    // Fetch books when the page loads
    fetchBooks();

    // Google Sign-In
    googleSignInButton.addEventListener("click", signInWithGoogle);
});
