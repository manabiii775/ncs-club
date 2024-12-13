class CreateStampcards < ActiveRecord::Migration[7.0]
  def change
    create_table :stampcards do |t|

      t.timestamps
    end
  end
end
