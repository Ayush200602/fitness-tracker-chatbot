const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

let userState = {
    goal: null,
    age: null,
    height: null,
    weight: null,
    activity: null,
    step: 0
};

function addMessage(text, sender, isInitial = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    chatMessages.insertBefore(msgDiv, typingIndicator);

    // Format text
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br>');

    if (sender === 'bot' && !isInitial) {
        msgDiv.innerHTML = '';
        const fullHTML = formattedText;
        let i = 0;
        let isTag = false;
        
        function typeWriter() {
            if (i < fullHTML.length) {
                if (fullHTML.charAt(i) === '<') isTag = true;
                msgDiv.innerHTML = fullHTML.slice(0, i + 1) + (isTag ? '' : '<span class="cursor">|</span>');
                if (fullHTML.charAt(i) === '>') isTag = false;
                
                i++;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                let delay = isTag ? 0 : (Math.random() * 10 + 5); // Random fast delay for realistic AI streaming
                setTimeout(typeWriter, delay);
            } else {
                msgDiv.innerHTML = fullHTML; // remove cursor when done
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        typeWriter();
    } else {
        msgDiv.innerHTML = formattedText;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function showTyping() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = 'none';
}

function handleUserInput() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    showTyping();

    // Simulate AI processing delay
    setTimeout(() => {
        hideTyping();
        processBotResponse(text);
    }, 1000 + Math.random() * 500);
}

function processBotResponse(text) {
    const lowerText = text.toLowerCase();

    if (userState.step === 0) {
        userState.goal = text;
        userState.step = 1;
        addMessage("Got it! To give you a personalized plan, I need a few details. What is your age, height (in cm), and weight (in kg)?\n\n(e.g., '21, 170, 75')", 'bot');
    } else if (userState.step === 1) {
        const nums = text.match(/\d+/g);
        if (nums && nums.length >= 3) {
            userState.age = parseInt(nums[0]);
            userState.height = parseInt(nums[1]);
            userState.weight = parseInt(nums[2]);
            userState.step = 2;
            addMessage("Thanks! Lastly, how active are you? (e.g., low, moderate, highly active)", 'bot');
        } else {
            addMessage("I couldn't quite catch those numbers. Please provide your age, height (cm), and weight (kg) like '21, 170, 75'.", 'bot');
        }
    } else if (userState.step === 2) {
        userState.activity = text;
        userState.step = 3;

        const heightM = userState.height / 100;
        const bmi = (userState.weight / (heightM * heightM)).toFixed(1);

        let status = "normal weight";
        if (bmi < 18.5) status = "underweight";
        else if (bmi >= 25 && bmi < 29.9) status = "overweight";
        else if (bmi >= 30) status = "obese";

        let response = `Your BMI is approximately **${bmi}** (${status}). Based on your goal to '${userState.goal}', I recommend:\n\n`;

        if (userState.goal.toLowerCase().includes('weight') || userState.goal.toLowerCase().includes('lose')) {
            response += "🏃‍♂️ **30-45 mins of cardio** (4-5 days/week)\n";
            response += "🏋️‍♂️ **Strength training** (2-3 days/week)\n";
            response += "🥗 **Daily calorie intake:** ~1800-2000 kcal\n";
            response += "💧 **Hydration:** Drink at least 2.5L of water daily\n";
        } else {
            response += "🏋️‍♂️ **Strength training** (4-5 days/week)\n";
            response += "🏃‍♂️ **Light cardio** (1-2 days/week)\n";
            response += "🍗 **Protein Focus:** Aim for 1.6g+ protein per kg bodyweight\n";
            response += "💧 **Hydration:** Drink at least 3L of water daily\n";
        }

        response += "\nWould you like a more detailed weekly workout plan?";
        addMessage(response, 'bot');
    } else if (userState.step === 3) {
        if (lowerText.includes('yes') || lowerText.includes('sure') || lowerText.includes('yeah')) {
            userState.step = 4;
            addMessage("Awesome! Here is a sample plan:\n\n**Monday:** Full Body Strength\n**Tuesday:** 30 min Cardio + Core\n**Wednesday:** Rest / Active Recovery\n**Thursday:** Upper Body\n**Friday:** Lower Body\n**Saturday:** 45 min steady-state cardio (like brisk walking)\n**Sunday:** Rest\n\nRemember to aim for 8,000–10,000 steps per day! Can I help you with any specific exercises?", 'bot');
        } else {
            addMessage("No problem! Let me know if you have any questions about nutrition, specific exercises, or tracking your daily steps. I'm here to help!", 'bot');
            userState.step = 4;
        }
    } else {
        if (lowerText.includes('step') || lowerText.includes('walk')) {
            addMessage("Aiming for 8,000 to 10,000 steps a day is a great goal for overall health and burning extra calories. Try taking short walks after meals!", 'bot');
        } else if (lowerText.includes('water') || lowerText.includes('hydration')) {
            addMessage("Hydration is key! Try to drink at least 8 glasses (about 2 liters) of water daily. If you're sweating a lot, aim for closer to 3 liters.", 'bot');
        } else if (lowerText.includes('calorie') || lowerText.includes('diet')) {
            addMessage("Nutrition makes up 80% of your progress! Focus on lean proteins, complex carbs, and healthy fats. Want me to suggest some healthy snack ideas?", 'bot');
        } else {
            addMessage("That's a great question! While I'm a simple AI demo right now, consistency is your best friend in fitness. What else would you like to focus on?", 'bot');
        }
    }
}

sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});
