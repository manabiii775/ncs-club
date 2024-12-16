# QRコードの生成と保存
require 'rqrcode'

#一意のコードを生成
unique_code = "shared_qr_code"

#QRコードを生成
qr_code = RQRCode::QRCode.new("https://example.com/redeem?code=#{unique_code}")
png = qr_code.as_png(size: 200)

#QRコードのファイルを保存
file_path = Rails.root.join("public/qr_code.png")
IO.binwrite(file_path, png.to_s)