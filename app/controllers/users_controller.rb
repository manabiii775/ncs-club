class UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:show, :edit, :update]
  
  def show
    # @userはbefore_actionで設定されるので、ここでの処理は不要
  end
  
  def edit
    # @userはbefore_actionで設定済み
  end
  
  def update
    if @user.update(user_params)
      redirect_to root_path, notice: 'ユーザー情報が更新されました。'
    else
      render :edit
    end
  end
  
  private
  
  def set_user
    @user = User.find(params[:id])
  end
  
  def user_params
    params.require(:user).permit(:nickname, :email, :phone_number, :birthday) # 編集可能な属性を指定
  end
  
end
