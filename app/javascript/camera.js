document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');
  console.log('Turbo page loaded');
  initializeCameraButton(); // ページ遷移後にカメラボタンの初期化
  
  // Redeemボタンのイベントリスナーを追加
  const redeemButton = document.getElementById('redeem-drink');
  let isProcessing = false;

  if (redeemButton) {
    console.log('Redeem button found'); // 確認用ログ
    redeemButton.addEventListener('click', async function() {
      if (isProcessing) return; // 処理中なら何もしない
      isProcessing = true;
      console.log('Redeem button clicked'); // デバッグ用ログ

      const stampCardContainer = document.querySelector('.stamp-card-main');
      console.log('Stamp Card Container:', stampCardContainer); // デバッグ用ログ

      if (stampCardContainer) {
        const stampcardId = stampCardContainer.dataset.stampcardId;
        console.log('Stampcard ID:', stampcardId); // デバッグ用ログ

        try {
          const response = await fetch(`/stampcards/${stampcardId}/redeem`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
            }
          });
          console.log('Redeem request sent'); // デバッグ用ログ
          const data = await response.json();
          console.log('Redeem response:', data); // デバッグ用ログ
          alert(data.message);
          // ページをリロードしてスタンプカードの状態をリセット
          location.reload();
        } catch (error) {
          console.error('Error:', error);
          alert("交換処理に失敗しました。エラーメッセージ: " + error.message);
        } finally {
          isProcessing = false; // 最後にフラグをリセット
        }
      } else {
        console.error('Stamp Card Container not found'); // デバッグ用ログ
        isProcessing = false; // エラーハンドリング時にもフラグをリセット
      } 
    }, { once: true }); // ボタンのクリックイベントリスナーを1回限りに設定
  } else {
    console.error('Redeem button not found'); // デバッグ用ログ
  }
});

async function initializeCameraButton() {
  console.log("initializeCamera関数が呼び出されました");
  const startCameraButton = document.getElementById('start-camera');
  if (startCameraButton) {
    console.log("カメラボタンが見つかりました");
    startCameraButton.addEventListener('click', async () => {
      console.log("カメラボタンがクリックされました");
      const video = document.getElementById('camera');
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const headerElement = document.querySelector('header.main');
      const stampCardContainer = document.querySelector('.stamp-card-container');

      console.log('headerElement:', headerElement);
      console.log('stampCardContainer:', stampCardContainer);

      if (!headerElement) {
        console.error('Header要素が見つかりません。');
        return;
      }
      if (!stampCardContainer) {
        console.error('stampCardContainer要素が見つかりません。');
        return;
      }

      const userId = headerElement.dataset.userId;
      const stampcardId = stampCardContainer.dataset.stampcardId;

      console.log("ユーザーID:", userId);
      console.log("スタンプカードID:", stampcardId);

      let isProcessing = false;

      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          console.log("ビデオストリームが開始されました");
          video.srcObject = stream;

          video.addEventListener('play', () => {
            const tick = () => {
              if (video.paused || video.ended || isProcessing) return;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              console.log("QRコード認識結果: ", code);

              if (code) {
                isProcessing = true;
                const requestData = {
                  qr_code: code.data,
                  user_id: userId,
                  stampcard_id: stampcardId
                };

                console.log("送信するデータ:", JSON.stringify(requestData));
                console.log("リクエストURL:", `/stampcards/${stampcardId}/add_stamp`);

                fetch(`/stampcards/${stampcardId}/add_stamp`, {
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

          await video.play();
          video.style.display = 'block';
        } else {
          console.error('getUserMediaがサポートされていません。');
        }
      } catch (error) {
        console.error("ビデオの開始エラー: ", error);
      }
    });
  } else {
    console.error('カメラボタンが見つかりません。');
  }
}  

// ページ遷移時にカメラボタンを初期化するイベントリスナー
document.addEventListener('turbo:load', function() {
  console.log('Turbo page loaded');
  initializeCameraButton(); // ページ遷移後にカメラボタンの初期化
});