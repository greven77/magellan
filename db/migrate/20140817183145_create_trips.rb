class CreateTrips < ActiveRecord::Migration
  def change
    create_table :trips do |t|
      t.string :city
      t.string :country
      t.float :latitude
      t.float :longitude
      t.date :start
      t.date :end
      t.string :comment

      t.timestamps
    end
  end
end
