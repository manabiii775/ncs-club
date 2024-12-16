function initializeCamera() {
  const startCameraButton = document.getElementById('start-camera');
  if (startCameraButton) {
    /* カメラの起動 */
    /*「start-camera」ボタンがクリックされた時に非同期関数を実行 */
    startCameraButton.addEventListener('click', async () => {
    /* 「camera」IDを持つ<video>要素を取得 */
    const video = document.getElementById('camera');
    /* 「canvas」IDを持つ<canvas>要素を取得 */
    const canvas = document.getElementById('canvas');
    /* キャンバスのコンテキストを取得し、後で画像を描画できるようにする */
    const context = canvas.getContext('2d', { willReadFrequently: true });

    /* ビデオストリームの取得 */
    /* ユーザーのカメラへのアクセス許可を要求し、ビデオストリームを取得 */
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    /* 取得したストリームをビデオ要素に設定 */
    video.srcObject = stream;
    /* ビデオ再生を開始 */
    video.play();
    /* ビデオ要素を表示 */
    video.style.display = 'block';

    /* QRコードの読み取りとサーバーへのリクエスト送信 */
    /* ビデオの再生が開始された時に実行する関数を設定 */
    video.addEventListener('play', () => {
      /* tick関数を定義し、ループ処理を行う */
      const tick = () => {
        /* ビデオが一時停止または終了している場合は処理を中断 */
        if (video.paused || video.ended) return;
        /* ビデオのフレームをキャンバスに描画るす */
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        /* キャンバスから画像データを取得 */
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        /* ライブラリを使用してQRコードを認識 */
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        /* サーバーへのリクエスト */
        /* QRコードが認識された場合処理を開始 */
        if (code) {
          /* サーバーにPOSTリクエストを送信 */
          fetch('/stamp_cards/add_stamp', {
            /* HTTPメソッドとしてPOSTを使用 */
            method: 'POST',
            /* ヘッダーにContent-TypeとCSRFトークンを設定 */
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
            },
            /* リクエストのボディにQRコードのデータを含める */
            body: JSON.stringify({ qr_code: code.data.split('=')[1] })
            /* サーバーからのレスポンスをJSONとして解析 */
          }).then(response => response.json())
            /* サーバーからのメッセージをアラートで表示 */
            .then(data => alert(data.message));
           /* ビデオ要素を非表示 */
          video.style.display = 'none';
          /* カメラストリームを停止 */
          stream.getTracks().forEach(track => track.stop());
        } else {
          /* QRコードが認識されなかった場合、次のフレームで再度tick関数を呼び出す */
          requestAnimationFrame(tick);
        }
      };
      tick();
    });
  });
  } else {
    console.error('start-camera button not found');
  }
};

window.addEventListener('turbo:load', initializeCamera)