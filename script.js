// دالة لتوليد deviceID عشوائي
function generateDeviceID() {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// دالة لإنشاء الفيديو من الوصف
async function generateVideo() {
  const prompt = document.getElementById('prompt').value.trim();
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = ''; // مسح النتائج القديمة

  if (!prompt) {
    alert('من فضلك اكتب وصف الفيديو أولًا!');
    return;
  }

  const loadingText = document.createElement('p');
  loadingText.textContent = '⏳ جاري توليد الفيديو... اصبر شوية.';
  resultDiv.appendChild(loadingText);

  const deviceID = generateDeviceID();
  const apiUrl = 'https://text2video.aritek.app/txt2videov3';
  const videoUrl = 'https://text2video.aritek.app/video';

  try {
    // الخطوة 1: إرسال الطلب الأساسي لتوليد الفيديو
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-agent': 'NB Android/1.0.0',
        'accept-encoding': 'gzip'
      },
      body: JSON.stringify({
        prompt,
        deviceID,
        isPremium: 1,
        used: [],
        versionCode: 59
      })
    });

    const data = await res.json();
    if (data.code !== 0 || !data.key) {
      throw new Error('فشل في الحصول على المفتاح');
    }

    // الخطوة 2: المتابعة للحصول على رابط الفيديو
    const key = data.key;
    const payload = { keys: [key] };

    let attempts = 0;
    let maxAttempts = 100;
    let delay = 2000;
    let videoResult = null;

    while (attempts < maxAttempts) {
      attempts++;
      const res2 = await fetch(videoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': '', // مش ضروري هنا
          'user-agent': 'NB Android/1.0.0',
          'accept-encoding': 'gzip'
        },
        body: JSON.stringify(payload)
      });

      const finalData = await res2.json();
      if (
        finalData.code === 0 &&
        finalData.datas &&
        finalData.datas[0]?.url
      ) {
        videoResult = finalData.datas[0].url;
        break;
      }

      await new Promise(r => setTimeout(r, delay));
    }

    resultDiv.innerHTML = ''; // مسح الانتظار

    if (!videoResult) {
      resultDiv.innerHTML = '<p>❌ فشل التوليد بعد محاولات عديدة.</p>';
    } else {
      const video = document.createElement('video');
      video.controls = true;
      video.src = videoResult;
      video.autoplay = true;
      resultDiv.appendChild(video);
    }
  } catch (err) {
    resultDiv.innerHTML = `<p>❌ حصل خطأ: ${err.message}</p>`;
  }
}

// فتح النافذة المنبثقة
function openPopup() {
  document.getElementById('popup').style.display = 'flex';
}

// إغلاق النافذة المنبثقة
function closePopup() {
  document.getElementById('popup').style.display = 'none';
    }
