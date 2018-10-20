FactoryBot.define do
  factory :applicant do 
    first_name {Faker::Name.first_name}
    last_name {Faker::Name.last_name}
    email {Faker::Internet.email("#{first_name} #{last_name}", '')}
    student_number {Faker::Number.number(10)}
    utorid {Faker::Internet.slug("#{last_name} #{first_name} #{Faker::Number.number(2)}", '')}
  end
end
