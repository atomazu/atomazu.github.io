const symbols = [
  "ᕕ(ᐛ)ᕗ"
];

const loadElm = document.getElementById("loadElm");
loadElm.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
document.getElementById("postBtn").innerHTML = "";

document.getElementById("loginBtn").addEventListener("click", async function(event) {
  if (sessionStorage.getItem("token")) {
    if (confirm("Do you want to logout?")) {
      document.getElementById("loginBtn").innerHTML = "Login";
      document.getElementById("postBtn").innerHTML = "";
      sessionStorage.removeItem("token");
    }
    return;
  }

  const token = prompt("Please enter your authentication token.");
  if (token === null) {
    return; 
  }

  // const URL = 'http://localhost:3000/auth/validate';
  const URL = 'http://api.atomazu.org/auth/validate';
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(URL, {
      method: 'GET',
      headers: headers
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      sessionStorage.setItem("token", token);
      document.getElementById("loginBtn").innerHTML = "Logout"
      document.getElementById("postBtn").innerHTML = "Post";
    } else {
      const errorMessage = responseData.message || response.status;
      alert(`Authentication failed: ${errorMessage}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    alert(`An error occurred during the request: ${error.message}`);
  }
});
