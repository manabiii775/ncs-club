async function initializeCamera() {
  const startCameraButton = document.getElementById('start-camera');
  if (startCameraButton) {
    startCameraButton.addEventListener('click', async () => {
      const video = document.getElementById('camera');
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const userId = document.querySelector('header.main').dataset.userId;
      let isProcessing = false; // tick 関数が連続して実行されないようにするためのガードを追加

      // 既存のビデオストリームを停止
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // play()の前にイベントリスナーを登録
        video.addEventListener('play', () => {
          const tick = () => {
            if (video.paused || video.ended || isProcessing) return; // tick 関数が連続して実行されないようにするためのガードを追加
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            console.log("QRコード認識結果: ", code);

            if (code) {
              isProcessing = true;
              const requestData = {
                qr_code: code.data,
                user_id: userId
              };

              console.log("ユーザーID:", userId);
              console.log("送信するデータ:", JSON.stringify(requestData));
              console.log("リクエストURL:", `/stampcards/${userId}/add_stamp`);

              fetch(`/stampcards/${userId}/add_stamp`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(requestData)
              }).then(response => response.json())
                .then(data => {
                  alert(data.message);
                  isProcessing = false; 
                })
                .catch(error => {
                  console.error('Error:', error);
                  alert("スタンプの追加に失敗しました。エラーメッセージ: " + error.message);
                  isProcessing = false;
                });

              video.style.display = 'none';
              stream.getTracks().forEach(track => track.stop());
            } else {
              requestAnimationFrame(tick);
            }
          };
          tick();
        });

        // play() の呼び出し
        await video.play();
        video.style.display = 'block';
      } catch (error) {
        console.error("Error starting video: ", error);
      }
    });
  } else {
    console.error('start-camera button not found');
  }
}

window.addEventListener('turbo:load', initializeCamera);
