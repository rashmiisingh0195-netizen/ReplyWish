// Step 1: Get the elements from the page
const emailInput = document.getElementById("emailInput");
const createReplyBtn = document.getElementById("createReplyBtn");
const errorMessage = document.getElementById("errorMessage");
const replyCard = document.getElementById("replyCard");
const replyTag = document.getElementById("replyTag");
const replyOutput = document.getElementById("replyOutput");
const copyBtn = document.getElementById("copyBtn");
const copyStatus = document.getElementById("copyStatus");
const goalSelect = document.getElementById("goalSelect");

// Step 2: Find which tone the user selected
function getSelectedTone() {
  const selected = document.querySelector('input[name="tone"]:checked');
  return selected.value;
}

// Step 3: Run this code when the "Create sample reply" button is clicked
createReplyBtn.addEventListener("click", async function () {
  const emailText = emailInput.value.trim();

  // Check that the user pasted something
  if (emailText === "") {
    errorMessage.textContent = "Please paste an email first.";
    replyCard.hidden = true;
    emailInput.focus();
    return;
  }

  // Clear the old messages and show a loading state
  errorMessage.textContent = "";
  copyStatus.textContent = "";
  createReplyBtn.disabled = true;
  createReplyBtn.textContent = "Creating...";

  try {
    // Step 4: Send the email text, tone, and goal to the backend
    const response = await fetch("/api/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailText,
        tone: getSelectedTone(),
        goal: goalSelect.value
      })
    });

    // Step 5: Read the answer from the backend
    const data = await response.json();

    // If the backend sent an error (like status 400), show it
    if (!response.ok) {
      errorMessage.textContent = data.error || "Something went wrong.";
      replyCard.hidden = true;
      return;
    }

    // Step 6: Show the sample reply
    replyTag.textContent = data.label;
    replyOutput.textContent = data.reply;
    replyCard.hidden = false;
    replyCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    // Show the real error, so we can find the problem
    console.error(error);
    errorMessage.textContent = "Error: " + error.message;
    replyCard.hidden = true;
  } finally {
    // This always runs: turn the button back to normal
    createReplyBtn.disabled = false;
    createReplyBtn.textContent = "Create sample reply";
  }
});

// Step 7: Run this code when the "Copy reply" button is clicked
copyBtn.addEventListener("click", async function () {
  try {
    await navigator.clipboard.writeText(replyOutput.textContent);
    copyBtn.textContent = "Copied!";
    copyStatus.textContent = "Reply copied. Edit it before sending.";
  } catch (error) {
    copyStatus.textContent = "Could not copy. Please select the text and press Ctrl + C.";
  }

  // After 2 seconds, change the button text back
  setTimeout(function () {
    copyBtn.textContent = "Copy reply";
  }, 2000);
});