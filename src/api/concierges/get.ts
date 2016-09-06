import db from '../../data/connection';

export const one = async((id: number): Concierge.Concierge => {
  let query = await(db('Concierges')
    .select());

  return query[0];
});

export const all = async((): Concierge.Concierge[] => {
  let query = await(db('Concierges')
    .select());

  return query;
});