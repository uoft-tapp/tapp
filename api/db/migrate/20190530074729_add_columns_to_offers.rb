class AddColumnsToOffers < ActiveRecord::Migration[5.2]
  def change
    add_column :offers, :offer_template, :string
    add_column :offers, :offer_override_pdf, :string
    add_column :offers, :first_name, :string
    add_column :offers, :last_name, :string
    add_column :offers, :email, :string
    add_column :offers, :position_code, :string
    add_column :offers, :position_title, :string
    add_column :offers, :position_start_date, :datetime
    add_column :offers, :position_end_date, :datetime
    add_column :offers, :first_time_ta, :bool
    add_column :offers, :instructor_contact_desc, :string
    add_column :offers, :pay_period_desc, :string
    add_column :offers, :installments, :integer
    add_column :offers, :ta_coordinator_name, :string
    add_column :offers, :ta_coordinator_email, :string
    add_column :offers, :emailed_date, :datetime
    add_column :offers, :signature, :string
    add_column :offers, :accepted_date, :datetime
    add_column :offers, :rejected_date, :datetime
    add_column :offers, :withdrawn_date, :datetime
  end
end
