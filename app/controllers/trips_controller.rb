class TripsController < ApplicationController
  before_filter :authenticate_user_from_token!, except: [:autocomplete]
  before_action :set_trip, only: [:show, :update, :destroy]
  respond_to :json

  def create
    @trip = Trip.new(trip_params)
    @trip.user_id = @current_user.id

    if @trip.save
      render status: :created,
        json: @trip.as_json
    else
      render status: :unprocessable_entity,
        json: @trip.errors.as_json
    end
  end

  def update
    if @trip.update(trip_params)
      render status: :ok,
        json: @trip.as_json
      else
        render status: :unprocessable_entity,
          json: @trip.errors.as_json
      end
  end

  def destroy
    @trip.destroy
    render nothing: true, status: 204
  end

  def show
    if @trip
      render status: :ok,
        json: @trip.as_json
    else
      render status: :not_found,
        json: {
          error: "Trip #{params[:id]} not found"
        }
    end
  end

  def autocomplete
    results_list = Trip.query_google_autocomplete(params[:city])
    results = {:results => results_list}
    #results = {:results => [{id:0, city: "London"}, {id: 1, city: "Lisbon"}, {id: 2, city: "Berlin"}]};
    render status: :ok,
      json: results.as_json
  end

  def index
    @trips = Trip.where(user_id: @current_user.id)

    if @trips
      render status: :ok,
        json: @trips.as_json
    else
      render status: :not_found,
        json: {
          error: "Trips not found"
        }
    end
  end

  private

    def trip_params
      params.require(:trip)
        .permit(:city, :country, :start, :end, :comment)
    end

    def set_trip
      @trip = Trip.find(params[:id])
    end
end
