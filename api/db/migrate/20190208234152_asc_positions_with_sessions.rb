class AscPositionsWithSessions < ActiveRecord::Migration[5.2]
  def change
    add_reference :positions, :session, index: true
  end
end
