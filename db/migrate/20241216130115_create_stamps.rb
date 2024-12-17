class CreateStamps < ActiveRecord::Migration[7.0]
  def change
    create_table :stamps do |t|
      t.integer :stamp_number, null: false
      t.references :stampcard, null: false, foreign_key: true
      t.timestamps
    end
  end
end
