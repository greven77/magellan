require 'open-uri'

class Trip < ActiveRecord::Base
  validates :city, presence: true
  before_save :normalize_attributes

  def self.query_google_autocomplete(keyword)
    auto_complete_results(keyword)
  end

  private

  def normalize_attributes
    set_latitude_longitude
    set_city_country
  end

  def set_city_country
    city_and_country = self.city.split(",")
    self.city = city_and_country[0]
    self.country = city_and_country[1]
  end

  def set_latitude_longitude
    result = location_geocoding_map(self.city)
    self.latitude = result[:latitude]
    self.longitude = result[:longitude]
  end

    def geocoding_url(city)
      api_key = ENV["GOOGLE_API_KEY"]
      city = URI.encode(city)
      "https://maps.googleapis.com/maps/api/geocode/json?"+
      "address=#{city}&key=#{api_key}"
    end

    def self.auto_complete_url(keyword)
      api_key = ENV["GOOGLE_API_KEY"]
      city = URI.encode(keyword)
      url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?" + 
      "input=#{city}&types=(cities)&language=en_US" +
      "&key=#{api_key}"
    end

    def self.auto_complete_results(keyword)
      suggestions = []
      url = auto_complete_url(keyword)
      response = JSON.parse(open(url).read)["predictions"]
      response.each.with_index do |result, index|  
        suggestions << {id: index ,city: result["description"] }
      end

      suggestions
    end

    def location_geocoding_map(city)
      url = geocoding_url(city.split(",")[0])
      response = JSON.parse(open(url).read)["results"].first["geometry"]["location"]
      coordinates = {:latitude => response["lat"], :longitude => response["lng"]}
    end
end
