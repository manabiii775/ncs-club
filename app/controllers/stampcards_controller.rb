class StampcardsController < ApplicationController
  before_action :authenticate_user!, only: [:show, :add_stamp, :redeem]

  def index
    @stampcards = current_user&.stampcards || []
  end

  def show
    @stampcard = current_user.stampcards.find(params[:id])
    @stamps = @stampcard.stamps
  end
  
  def add_stamp
    request_body = request.body.read
    Rails.logger.info("リクエストボディ: #{request_body}")
    
    begin
      qr_content = JSON.parse(request_body)
      Rails.logger.info("QRコード内容: #{qr_content}")

      # QRコード内容をデバック出力
      if qr_content["qr_code"].is_a?(String)
        decoded_qr_content = JSON.parse(qr_content["qr_code"])
        Rails.logger.info("デコードされたQRコード内容: #{decoded_qr_content}")
      else
        decoded_qr_content = qr_content["qr_code"]
      end

      if decoded_qr_content["qr_code"] == "shared_qr_code"
        stampcard_id = qr_content["stampcard_id"]
        stampcard = current_user.stampcards.find_by(id: stampcard_id)
        Rails.logger.info("スタンプカード: #{stampcard.inspect}")
  
        if stampcard
          ActiveRecord::Base.transaction do
            # ユーザーが今日既にスタンプを追加しているか確認
            today_start = Time.zone.now.beginning_of_day
            today_end = Time.zone.now.end_of_day
            existing_stamp = stampcard.stamps.where(created_at: today_start..today_end).exists?

            if existing_stamp
              render json: { message: "スタンプは1日1回までです。" }, status: :forbidden
            else
              current_stamp_count = stampcard.stamps.lock.count
                # 既存のスタンプ数を確認
                current_stamp_count = stampcard.stamps.count
                # スタンプがまだ10個に達していない場合のみ追加
              if current_stamp_count < 10
                # 共通のQRコードを使用
                qr_code = QrCode.find_or_create_by(code: "shared_qr_code")
                stampcard.stamps.create!(stamp_number: current_stamp_count + 1)
                render json: { message: "スタンプが追加されました！" }, status: :ok
              else
                render json: { message: "スタンプカードは既に10個のスタンプが追加されています。" }, status: :unprocessable_entity
              end
            end
          end
        else
          Rails.logger.warn("無効なスタンプカードID: #{params[:id]}")
          render json: { message: "無効なスタンプカードIDです。" }, status: :unprocessable_entity
        end
      else
        Rails.logger.warn("無効なQRコード: #{qr_content["qr_code"]}")
        render json: { message: "無効なQRコードです。" }, status: :unprocessable_entity
      end
    rescue JSON::ParserError => e
      Rails.logger.error("JSONの解析に失敗しました: #{e.message}")
      render json: { message: "JSONの解析に失敗しました: #{e.message}" }, status: :unprocessable_entity
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error("データベースの保存に失敗しました: #{e.message}")
      render json: { message: "データベースの保存に失敗しました: #{e.message}" }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error("予期せぬエラーが発生しました: #{e.message}")
      render json: { message: "予期せぬエラーが発生しました: #{e.message}" }, status: :internal_server_error
    end
  end
  
  def redeem
    Rails.logger.info("redeemメソッドが呼び出されました。スタンプカードID: #{params[:id]}")
    stampcard = current_user.stampcards.find(params[:id])
    if stampcard.stamps.count == 10
      stampcard.stamps.destroy_all
      Rails.logger.info("スタンプカードをリセットしました。")
      render json: { message: "ドリンクと交換しました！スタンプカードをリセットしました。" }, status: :ok
    end
  rescue => e
      Rails.logger.error("予期せぬエラーが発生しました: #{e.message}")
      render json: { message: "予期せぬエラーが発生しました: #{e.message}" }, status: :internal_server_error
  end

end
