import db from '../../data/connection';

export const one = async((id: number): Concierge.Application => {
    let query = await(db('Applications')
		  .select()
      .where({ id }));
    
    return query[0];
});

export const all = async((): Concierge.Application[] => {
    let query = await(db('Applications')
		  .select());
    
    return query;
});