class CreateOffers < ActiveRecord::Migration[6.0]
    def change
        create_table :offers do |t|
            t.references :assignment, null: false, foreign_key: true
            t.string :offer_template
            t.string :offer_override_pdf
            t.string :first_name
            t.string :last_name
            t.string :email
            t.string :position_code
            t.string :position_title
            t.datetime :position_start_date
            t.datetime :position_end_date
            t.boolean :first_time_ta
            t.string :instructor_contact_desc
            t.string :pay_period_desc
            t.integer :installments
            t.string :ta_coordinator_name
            t.string :ta_coordinator_email
            t.datetime :emailed_date
            t.string :signature
            t.datetime :accepted_date
            t.datetime :rejected_date
            t.datetime :withdrawn_date
            t.integer :nag_count, default: 0
            t.string :url_token

            t.timestamps
        end
        add_index :offers, :url_token
    end
end
