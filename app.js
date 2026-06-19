document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadingEl = document.getElementById('loading');
    const finishedEl = document.getElementById('finished');
    const interfaceEl = document.getElementById('test-interface');
    const logoImage = document.getElementById('logo-image');
    const inputField = document.getElementById('association-input');
    const submitBtn = document.getElementById('submit-button');

    // State
    let availableImages = [];
    let currentImage = null;
    let isSubmitting = false;
    let imageAnswers = {};
    const totalTestImages = 50;
    let testImageIndex = 0;

    const introEl = document.getElementById('intro-interface');
    const startSurveyBtn = document.getElementById('start-survey-btn');
    const dynamicQuestionsContainer = document.getElementById('dynamic-questions-container');
    const introProgressFill = document.getElementById('intro-progress');
    const introProgressText = document.getElementById('intro-progress-text');

    // Intro State
    let introData = {};
    const totalIntroQuestions = 20;
    const mockQuestions = [];

    // Generate 50 mock questions
    for(let i=1; i<=totalIntroQuestions; i++) {
        mockQuestions.push({
            id: `q${i}`,
            text: `${i}. Bu değerlendirme için hazırlanan örnek (mock) test sorusudur.`
        });
    }

    // Render questions into the DOM
    if (dynamicQuestionsContainer) {
        mockQuestions.forEach(q => {
            const div = document.createElement('div');
            div.className = 'question-item';
            div.innerHTML = `
                <p class="question-text">${q.text}</p>
                <div class="likert-wrapper">
                    <span class="likert-label">Kesinlikle Katılmıyorum</span>
                    <div class="likert-options">
                        <label><input type="radio" name="${q.id}" value="1"><span>1</span></label>
                        <label><input type="radio" name="${q.id}" value="2"><span>2</span></label>
                        <label><input type="radio" name="${q.id}" value="3"><span>3</span></label>
                        <label><input type="radio" name="${q.id}" value="4"><span>4</span></label>
                        <label><input type="radio" name="${q.id}" value="5"><span>5</span></label>
                        <label><input type="radio" name="${q.id}" value="6"><span>6</span></label>
                        <label><input type="radio" name="${q.id}" value="7"><span>7</span></label>
                    </div>
                    <span class="likert-label">Kesinlikle Katılıyorum</span>
                </div>
            `;
            dynamicQuestionsContainer.appendChild(div);
        });
    }

    // Update progress and check completion
    function checkIntroCompletion() {
        let answeredCount = 0;
        introData = {}; // Reset and rebuild to ensure accuracy
        
        mockQuestions.forEach(q => {
            const checked = document.querySelector(`input[name="${q.id}"]:checked`);
            if (checked) {
                answeredCount++;
                // Anahtar olarak sadece numarayı kullan (q1 -> 1, q2 -> 2 vb.)
                const questionNum = q.id.replace('q', '');
                introData[questionNum] = parseInt(checked.value);
            }
        });
        
        // Update progress UI
        const percentage = (answeredCount / totalIntroQuestions) * 100;
        introProgressFill.style.width = `${percentage}%`;
        introProgressText.textContent = `${answeredCount} / ${totalIntroQuestions} Cevaplandı`;

        if (answeredCount === totalIntroQuestions) {
            startSurveyBtn.disabled = false;
        }
    }

    // Add listeners to likert scales
    document.querySelectorAll('#dynamic-questions-container input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', checkIntroCompletion);
    });

    // Start survey logic: Proceed to main test without submitting yet
    startSurveyBtn.addEventListener('click', () => {
        console.log("Intro Assessment State Saved:", introData);
        introEl.style.display = 'none';
        loadNextImage();
    });

    // Initialize the app (Static Version for GitHub Pages)
    async function init() {
        try {
            // GitHub Pages için sunucu bağlantısı kaldırıldı.
            // BURAYA KENDİ GÖRSEL İSİMLERİNİZİ GİRMELİSİNİZ (Örn: "tardi_mavi.png")
            // Şimdilik test edebilmeniz için 50 tane sahte görsel ismi oluşturuyoruz.
            let images = [
                "tardi_mavi.png", "koa_kirmizi.png", "logo3_yesil.png", "logo4_sari.png"
            ];
            
            // Eğer dizide 50'den az eleman varsa, testin 50'ye tamamlanması için sahte elemanlarla dolduruyoruz
            // Gerçek logolarınızı yukarıdaki diziye tam 80 adet olarak yazdığınızda bu if bloğunu silebilirsiniz.
            if (images.length < totalTestImages) {
                const missingCount = totalTestImages - images.length;
                for(let i=0; i < missingCount; i++) {
                    images.push(`mock${i+5}_renk.png`);
                }
            }
            
            if (images.length === 0) {
                loadingEl.textContent = 'Görsel bulunamadı.';
                return;
            }

            // Shuffle the array of images and take up to totalTestImages (50)
            availableImages = shuffleArray(images).slice(0, totalTestImages);
            
            // Show the intro screen instead of starting the test immediately
            loadingEl.style.display = 'none';
            introEl.style.display = 'flex';

        } catch (error) {
            console.error('Failed to initialize:', error);
            loadingEl.textContent = 'Bir hata oluştu.';
        }
    }

    const testProgressFill = document.getElementById('test-progress');
    const testProgressText = document.getElementById('test-progress-text');

    // Load the next image in the sequence
    function loadNextImage() {
        if (availableImages.length === 0) {
            // All images shown, submit everything to Formspree
            submitAllData();
            return;
        }

        testImageIndex++;
        
        // Update Test Progress Bar UI
        const percentage = (testImageIndex / totalTestImages) * 100;
        if (testProgressFill) testProgressFill.style.width = `${percentage}%`;
        if (testProgressText) testProgressText.textContent = `${testImageIndex} / ${totalTestImages} Görsel`;

        // Pop the next image from the randomized array
        currentImage = availableImages.pop();
        
        // Hide loading, show interface
        loadingEl.style.display = 'none';
        interfaceEl.style.display = 'flex';
        
        // Reset input and button
        inputField.value = '';
        inputField.disabled = false;
        submitBtn.disabled = false;
        isSubmitting = false;

        // Set image source (Test versiyonu: Rastgele picsum görselleri)
        logoImage.src = `https://picsum.photos/400/300?random=${Math.random()}`;
        
        // Focus the input automatically
        inputField.focus();
    }

    // Handle the submission
    function submitResponse() {
        if (isSubmitting) return;

        const rawValue = inputField.value.trim();
        if (!rawValue) return; // Do nothing if empty

        // Strict single word enforcement: Just grab the first sequence of non-whitespace characters
        const userWord = rawValue.split(/\s+/)[0];

        isSubmitting = true;
        inputField.disabled = true;
        submitBtn.disabled = true;

        // CSV formatı için 1'den 70'e kesintisiz devam etmesi istendi.
        // Likert 1-20 arasıydı, görseller 21'den başlayarak devam edecek.
        const imageKey = (totalIntroQuestions + testImageIndex).toString();
        imageAnswers[imageKey] = userWord;

        // Move to next image immediately without making backend request
        loadNextImage();
    }

    // Submit all data (Intro + Images) to Formspree at the very end
    async function submitAllData() {
        // Show loading state
        interfaceEl.style.display = 'none';
        loadingEl.style.display = 'block';
        loadingEl.textContent = 'Cevaplarınız kaydediliyor, lütfen sayfayı kapatmayın...';

        const finalPayload = {
            "Tarih": new Date().toLocaleString('tr-TR'),
            ...introData,
            ...imageAnswers
        };
        
        console.log("Final Payload:", finalPayload);

        try {
            const formspreeEndpoint = 'https://formspree.io/f/mlgkqrbd';
            
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalPayload)
            });

            if (!response.ok) {
                throw new Error('Formspree submission failed');
            }

            // Success
            loadingEl.style.display = 'none';
            finishedEl.style.display = 'block';
            
        } catch (error) {
            console.error('Error submitting final data:', error);
            alert('Bir hata oluştu, verileriniz kaydedilemedi. Lütfen tekrar deneyin.');
            loadingEl.textContent = 'Bir hata oluştu. Sayfayı yenileyip tekrar denemeniz gerekebilir.';
        }
    }

    // --- Event Listeners for Single Word Enforcement ---

    // Prevent typing spaces
    inputField.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault(); // Stop the space from being typed
        } else if (e.key === 'Enter') {
            e.preventDefault();
            submitResponse();
        }
    });

    // Handle pasting (trim to single word)
    inputField.addEventListener('paste', (e) => {
        e.preventDefault(); // Stop the default paste action
        
        // Get the pasted text
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        
        // Extract just the first word
        const firstWord = pastedText.trim().split(/\s+/)[0];
        
        // Insert it manually
        if (firstWord) {
            // Get current value and cursor position to properly insert (though usually it's just appending)
            // For simplicity in a 1-word field, we can just replace or append
            const currentVal = inputField.value;
            // Since spaces are prevented, currentVal is at most 1 word.
            // If they paste over a selection, or append, let's just use the first word of the paste.
            // A simpler approach: Just set the value to what they pasted (first word only) 
            // if the field is empty, or append if it's not.
            inputField.value = currentVal + firstWord;
        }
    });

    // Handle submit button click
    submitBtn.addEventListener('click', submitResponse);

    // Utility: Fisher-Yates shuffle
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Kick things off
    init();
});
