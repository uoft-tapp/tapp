class ActiveSupport::TimeWithZone
  def as_json(options = {})
    %(#{time.strftime("%Y/%m/%d")})
  end
end
