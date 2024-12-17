class CreateStampcards < ActiveRecord::Migration[7.0]
  def change
    create_table :stampcards do |t|
      t.integer :total_stamps, null: false
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
  end
end
