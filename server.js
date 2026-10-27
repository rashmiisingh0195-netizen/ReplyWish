// Step 1: Load the tools we need
const express = require("express");
const path = require("path");

// Step 2: Create the app and choose a port number
const app = express();
const PORT = process.env.PORT || 3000;

// Step 3: Middleware (code that runs on every request)
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Step 4: Tones. Each tone changes the greeting, opening, extra line, and closing.
const tones = {
  professional: {
    label: "Professional",
    greeting: "Hello,",
    opening: "Thank you for your email.",
    extra: "Please let me know if you need any further information.",
    closing: "Kind regards,"
  },
  friendly: {
    label: "Friendly",
    greeting: "Hi there,",
    opening: "Thanks so much for your email!",
    extra: "Feel free to message me if you have any questions.",
    closing: "Best wishes,"
  },
  apologetic: {
    label: "Apologetic",
    greeting: "Hello,",
    opening: "Thank you for your email, and I am sorry for the delay in replying.",
    extra: "Thank you for your patience and understanding.",
    closing: "Sincerely,"
  },
  confident: {
    label: "Confident",
    greeting: "Hello,",
    opening: "Thank you for your email.",
    extra: "I am happy to discuss this further whenever you are ready.",
    closing: "Best regards,"
  }
};

// Step 5: Goals. Each goal is the main message of the reply.
const goals = {
  general: {
    label: "General reply",
    body: "I have read your message and will get back to you with a full response soon."
  },
  accept: {
    label: "Accept",
    body: "I am glad to accept, and I will take care of the next steps."
  },
  decline: {
    label: "Decline",
    body: "After careful thought, I am unable to accept this request at the moment."
  },
  moretime: {
    label: "Ask for more time",
    body: "I need a little more time to review the details. I will reply by [date]."
  },
  thanks: {
    label: "Say thanks",
    body: "I really appreciate your help and the time you spent on this."
  }
};

// Step 6: A function that builds the reply from the small parts
function buildReply(toneKey, goalKey) {
  const tone = tones[toneKey];
  const goal = goals[goalKey];

  const text =
    tone.greeting + "\n\n" +
    tone.opening + " " + goal.body + "\n\n" +
    tone.extra + "\n\n" +
    tone.closing + "\n[Your Name]";

  return {
    label: tone.label + " tone - " + goal.label,
    text: text
  };
}

// Step 7: An optional test route to check that the server is running
app.get("/api/health", function (req, res) {
  res.json({ status: "ok" });
});

// Step 8: The main API endpoint. The frontend sends email + tone + goal here.
app.post("/api/reply", function (req, res) {
  const body = req.body || {};
  const email = body.email;
  const tone = body.tone;
  // If no goal is sent, use "general" (the default value)
  const goal = body.goal === undefined ? "general" : body.goal;

  // Check the email text
  if (typeof email !== "string" || email.trim() === "") {
    return res.status(400).json({ error: "Please send the email text." });
  }

  if (email.length > 5000) {
    return res
      .status(400)
      .json({ error: "The email is too long. Please use under 5000 characters." });
  }

  // Check the tone and the goal (Object.hasOwn checks that the key really exists)
  if (typeof tone !== "string" || !Object.hasOwn(tones, tone)) {
    return res.status(400).json({ error: "Please choose a valid tone." });
  }

  if (typeof goal !== "string" || !Object.hasOwn(goals, goal)) {
    return res.status(400).json({ error: "Please choose a valid goal." });
  }

  // Build the sample reply and send it back, clearly labeled
  const result = buildReply(tone, goal);
  res.json({
    label: result.label,
    reply: result.text,
    generatedBy: "Fixed template on the backend (not AI-generated)"
  });
});

// Step 9: Start the server
app.listen(PORT, function () {
  console.log("ReplyWise is running at http://localhost:" + PORT);
});