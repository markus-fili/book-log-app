db.collection("test").add({ message: "Firebase is connected!" })
.then(() => console.log("Test document added!"))
.catch(error => console.error("Error adding document:", error));

