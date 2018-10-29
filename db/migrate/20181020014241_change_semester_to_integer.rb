class ChangeSemesterToInteger < ActiveRecord::Migration[5.1]
  def change
    # Since postgres complains about changing varchar to integer, we have to use this syntax.
    change_column :sessions, :semester, 'integer using CAST(semester as integer)', default: 0
  end
end
