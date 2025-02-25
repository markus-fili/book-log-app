import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";



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
const auth = getAuth();
const db = getFirestore(app);

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("books");

    // Function to show confirmation message
    function showConfirmationMessage(message) {
        const confirmationMessage = document.createElement("div");
        confirmationMessage.classList.add("confirmation-message");
        confirmationMessage.innerText = message;

        // Add to the page
        document.body.appendChild(confirmationMessage);

        // Hide after 3 seconds
        setTimeout(() => {
            confirmationMessage.remove();
        }, 3000);
    }

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
                    showConfirmationMessage("Book removed successfully!");
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
            showConfirmationMessage("Book added successfully!");
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
                id: new TextEncoder().encode("user_id"), // Use user-specific ID
                name: "username",
                displayName: "Username"
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }]  // Use ES256
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
                id: new TextEncoder().encode("stored-public-key-id"), // Retrieve stored public key ID
                type: "public-key"
            }]
        };

        try {
            const assertion = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions
            });

            console.log("Biometric authentication successful:", assertion);
            // After successful authentication, sign in the user using Firebase Auth
            // You will need to verify the assertion on the server or Firebase
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
async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        showConfirmationMessage(`Welcome, ${user.displayName}!`);
        console.log("Google Sign-In successful:", user);
    } catch (error) {
        showErrorMessage("Google Sign-In failed.");
        console.error("Error during Google Sign-In:", error);
    }
}

// Attach Google Sign-In to a button (make sure you have a button with id="google-signin")
document.getElementById("google-signin").addEventListener("click", signInWithGoogle);

    
});
