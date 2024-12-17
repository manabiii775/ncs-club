class StampcardsController < ApplicationController
  before_action :authenticate_user!, only: [:show]

  def index
    @stampcards = current_user.stampcards
  end

  def show
    @stampcard = current_user.stampcards.find(params[:id])
    @stamps = @stampcard.stamps
  end
  
  def add_stamp
    if params[:qr_code] == "shared_qr_code"
      stampcard = current_user.stampcards.find_or_create_by(id: params[:stampcard_id])
  
      # 10個のスタンプの位置を決める
      positions = [
        { x: 20, y: 20 }, { x: 80, y: 20 }, { x: 140, y: 20 },
        { x: 200, y: 20 }, { x: 260, y: 20 }, { x: 20, y: 80 },
        { x: 80, y: 80 }, { x: 140, y: 80 }, { x: 200, y: 80 },
        { x: 260, y: 80 }
      ]
  
      positions.each_with_index do |position, index|
        stampcard.stamps.create!(stamp_number: index + 1, x: position[:x], y: position[:y])
      end
  
      respond_to do |format|
        format.json { render json: { message: "スタンプが追加されました！" } }
      end
    else
      respond_to do |format|
        format.json { render json: { message: "無効なQRコードです。" }, status: :unprocessable_entity }
      end
    end
  end
end
