-- پێش هەمی تشتەکێ، دڤێت ستوونێن 'latitude' و 'longitude' ل خشتەیا 'profiles' زێدە بکەین
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude float,
ADD COLUMN IF NOT EXISTS longitude float;

create or replace function find_nearby_players(
  user_lat float,
  user_lon float,
  search_radius_km float,
  current_user_id uuid
)
returns table (
  id uuid,
  nickname text,
  avatar_url text,
  xp int,
  distance_km float
)
language sql
as $$
  select
    id,
    nickname,
    avatar_url,
    xp,
    (
      6371 * acos(
        cos(radians(user_lat))
        * cos(radians(latitude))
        * cos(radians(longitude) - radians(user_lon))
        + sin(radians(user_lat)) * sin(radians(latitude))
      )
    ) as distance_km
  from
    profiles
  where
    id != current_user_id
    and latitude is not null
    and longitude is not null
    and (
      6371 * acos(
        cos(radians(user_lat))
        * cos(radians(latitude))
        * cos(radians(longitude) - radians(user_lon))
        + sin(radians(user_lat)) * sin(radians(latitude))
      )
    ) <= search_radius_km
  order by
    distance_km asc
  limit 15;
$$;
