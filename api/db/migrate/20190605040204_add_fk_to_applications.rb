class AddFkToApplications < ActiveRecord::Migration[5.2]
  def change
    	add_reference :applications, :session, index: true
  end
end
