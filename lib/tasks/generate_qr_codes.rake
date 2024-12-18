namespace :qr do
  desc "Generate QR code"
  task generate: :environment do
    require 'rqrcode'
    require 'chunky_png'

    qr_content = { qr_code: "shared_qr_code" }.to_json

    # QRコードを生成
    qrcode = RQRCode::QRCode.new(qr_content)

    # QRコードを画像ファイルとして保存
    png = qrcode.as_png(
      resize_gte_to: false,
      resize_exactly_to: false,
      fill: 'white',
      color: 'black',
      size: 200, # サイズをバイト数に対応する値に設定
      border_modules: 4, # ボーダーの幅を小さくする
      module_px_size: 6, # 各モジュールのピクセルサイズを小さくする
      file: nil
    ) 

    # 画像ファイルとして保存するパスを設定
    file_path = "public/qr_code.png"

    # 画像ファイルとして保存
    IO.binwrite(file_path, png.to_s)

    puts "QRコードを#{file_path}に保存しました。"
  end
end

