class SetSessionsIdToRoundId < ActiveRecord::Migration[5.2]
  def change
    # Ideally this is done with SQL
    Position.all.each{|p| p.update_attribute(:session_id, p.round.session_id)}
    add_foreign_key: :positions, :sessions
  end
end
