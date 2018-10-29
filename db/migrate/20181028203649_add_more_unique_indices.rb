class AddMoreUniqueIndices < ActiveRecord::Migration[5.1]
  def change
    # Position
    add_index :positions, [:course_code, :round_id], unique: true
    
    # Preference
    add_index :preferences, [:applicant_id, :position_id], unique: true

    # Round
    add_index :rounds, [:session_id, :number], unique: true

    # Session
    add_index :sessions, [:year, :semester], unique: true
  end
end
