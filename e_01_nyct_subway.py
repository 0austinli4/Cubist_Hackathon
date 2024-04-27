import argparse
from datetime import datetime, timedelta
from typing import List, Tuple
import app

import csp

from csp_mta_team import (
    GTFS_DIRECTION,
    LINE_TO_ENDPOINT,
    STOP_INFO_DF,
    GTFSRealtimeInputAdapter,
    nyct_subway_pb2,
)

def get_stop_time_at_station(entity, stop_id):
    """
    Helper Python function to get the stop time at a station
    """
    if entity.HasField("trip_update"):
        stop_time_updates = entity.trip_update.stop_time_update
        for update in stop_time_updates:
            # could be N or S
            if (
                stop_id in update.stop_id
                and datetime.fromtimestamp(update.arrival.time) >= datetime.now()
            ):
                return update.arrival.time
    return None

def get_delay_station_time(entity, stop_id):
    """
    Helper Python function to get the stop time at a station
    """
    if entity.HasField("trip_update"):
        stop_time_updates = entity.trip_update.stop_time_update
        for update in stop_time_updates:
            if (
                stop_id in update.stop_id
                and datetime.fromtimestamp(update.arrival.time) >= datetime.now()
                and update.arrival.delay > 0
            ):
                return update.arrival.delay  
    return None


@csp.node
def filter_trains_headed_for_stop(
    gtfs_msgs: csp.ts[object], stop_id: str
) -> csp.ts[object]:
    """
    Filters the GTFS messages to only include trains that are currently headed for a stop with a given stop_id, found in stops.txt
    Any train that has either passed the stop or does not stop at said stop will be ignored
    """
    relevant_entities = []
    for entity in gtfs_msgs.entity:
        if get_stop_time_at_station(entity, stop_id):
            relevant_entities.append(entity)
    return relevant_entities


@csp.node
def filter_trains_delayed_for_stop(
    gtfs_msgs: csp.ts[object], stop_id: str
) -> csp.ts[object]:
    """
    Filters the GTFS messages to only include trains that are currently headed for a stop with a given stop_id, found in stops.txt
    Any train that has either passed the stop or does not stop at said stop will be ignored
    """
    relevant_entities = []
    for entity in gtfs_msgs.entity:
        if get_delay_station_time(entity, stop_id):
            relevant_entities.append(entity)
    return relevant_entities

@csp.node
def next_N_delay_at_stop(
    gtfs_msgs: csp.ts[object], stop_id: str, N: int
) -> csp.ts[object]:
    """
    Returns the TripUpdate objects of the next N trains approaching the stop
    """
   # gtfs_msgs.sort(key=lambda entity: get_stop_time_at_station(entity, stop_id))
    gtfs_msgs.sort(key=lambda entity: get_delay_station_time(entity, stop_id))
    
    return gtfs_msgs[:N]


def get_terminus(entity):
    return entity.trip_update.stop_time_update[-1].stop_id


def entities_to_departure_board_str(entities, stop_id):
    """
    Helper function to pretty-print train info
    """
    avg_time = 0

    dep_str = f'\n At station {STOP_INFO_DF.loc[stop_id, "stop_name"]}\n\n'
    for entity in entities:
        route = entity.trip_update.trip.route_id
        direction = GTFS_DIRECTION[
            entity.trip_update.trip.Extensions[
                nyct_subway_pb2.nyct_trip_descriptor
            ].direction
        ]
        terminus = get_terminus(entity)
        arrival = datetime.fromtimestamp(get_stop_time_at_station(entity, stop_id))
        delta = arrival - datetime.now()
        avg_time += delta.total_seconds()
        dep_str += f'{direction} {route} train to {STOP_INFO_DF.loc[terminus, "stop_name"]} in {round(delta.total_seconds() // 60)} minutes\n'
    
    avg_time /= 10
    return str(avg_time)

@csp.graph
def delay_board(platforms: List[Tuple[str, str]], N: int):
    """
    csp graph which ticks out the next N trains approaching the provided stations on each given line
    """
    for service in platforms:
        stop_id, line = service
        line_data = GTFSRealtimeInputAdapter(line, False)
        trains_headed_for_station = filter_trains_delayed_for_stop(line_data, stop_id)
        next_N_trains = next_N_delay_at_stop(trains_headed_for_station, stop_id, N)
        dep_str = csp.apply(
            next_N_trains,
            lambda x, key_=stop_id: entities_to_departure_board_str(x, key_),
            str,
        )
        #csp.print("Departure Board", dep_str)

@csp.node
def next_N_trains_at_stop(
    gtfs_msgs: csp.ts[object], stop_id: str, N: int
) -> csp.ts[object]:
    """
    Returns the TripUpdate objects of the next N trains approaching the stop
    """
    gtfs_msgs.sort(key=lambda entity: get_stop_time_at_station(entity, stop_id))
    # print("MESSSSAGESS")
    # print(gtfs_msgs[:N])
    return gtfs_msgs[:N]

@csp.node
def send_to_my_app(avg_time: csp.ts[str]):
    # , app: object
    if csp.ticked(avg_time):
        app.train_order(avg_time)

@csp.graph
def departure_board(platforms: List[Tuple[str, str]], N: int):
    # , app: object
    """
    csp graph which ticks out the next N trains approaching the provided stations on each given line
    """
    for service in platforms:
        stop_id, line = service
        line_data = GTFSRealtimeInputAdapter(line, False)
        trains_headed_for_station = filter_trains_headed_for_stop(line_data, stop_id)
        next_N_trains = next_N_trains_at_stop(trains_headed_for_station, stop_id, N)
        avg_time = csp.apply(
            next_N_trains,
            lambda x, key_=stop_id: entities_to_departure_board_str(x, key_),
            str,
        )
        # csp.print("MY DEP STR", dep_str)
        send_to_my_app(avg_time)
        #csp.print("Departure Board", dep_str)

def run_delay(platforms):
    run_graph = True
    num_trains = 10
    # print(platforms, show_graph, run_graph, num_trains)

    # Process input data
    platforms_to_subscribe_to = []
    for platform in platforms:
        stop_id, train_line = tuple(platform.split(":"))

        # process which line to track
        found = False
        for line in LINE_TO_ENDPOINT.keys():
            if train_line in line:
                train_line = line
                found = True
                break
        if not found:
            raise ValueError(f"Did not recognize service {train_line}")

        # process stop_id
        if stop_id not in STOP_INFO_DF.index:
            raise ValueError(
                f"Did not recognize stop_id {stop_id}: see stops.txt for valid stop_ids"
            )

        platforms_to_subscribe_to.append((stop_id, train_line))
    if run_graph:
        csp.run(
            delay_board,
            platforms_to_subscribe_to,
            num_trains,
            starttime=datetime.utcnow(),
            endtime=timedelta(minutes=1),
            realtime=True,
        )

def trains_now_board(platforms):
    run_graph = True
    num_trains = 10

    # Process input data
    platforms_to_subscribe_to = []
    for platform in platforms:
        stop_id, train_line = tuple(platform.split(":"))

        # process which line to track
        found = False
        for line in LINE_TO_ENDPOINT.keys():
            if train_line in line:
                train_line = line
                found = True
                break
        if not found:
            raise ValueError(f"Did not recognize service {train_line}")

        # process stop_id
        if stop_id not in STOP_INFO_DF.index:
            raise ValueError(
                f"Did not recognize stop_id {stop_id}: see stops.txt for valid stop_ids"
            )

        platforms_to_subscribe_to.append((stop_id, train_line))

    # departure_board(platforms_to_subscribe_to, num_trains)
    print("RUNNING GRAPH")
    if run_graph:
        csp.run(
            departure_board,
            platforms_to_subscribe_to,
            num_trains,
            starttime=datetime.utcnow(),
            endtime=timedelta(minutes=1),
            realtime=True,
        )


# def trains_now_board(platforms):
#     run_graph = True
#     num_trains = 40

#     # Adapt this section to suit how data needs to be prepared and run
#     platforms_to_subscribe_to = []
#     for platform in platforms:
#         stop_id, train_line = platform.split(":")
#         platforms_to_subscribe_to.append((stop_id, train_line))

#     if run_graph:
#         # Simulate a run; adapt to actual use case
#         result = departure_board(platforms_to_subscribe_to, num_trains)
#         return result
#     else:
#         return {'message': 'Graph not run'}
    

if __name__ == "__main__":
    platforms = ['127:123']
    # run_delay(platforms)
    # departure_board(platforms, 20)
    trains_now_board(platforms)