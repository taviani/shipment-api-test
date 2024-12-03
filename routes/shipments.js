var express = require('express');
var router = express.Router();
var sql = require('../database.js');


/* GET users listing. */
router.get('/', async function(req, res, next) {


  if(!req.query.company_id) {
    return res.status(422).json({errors:["company_id is required"]});
  };


  let orderBy = 'id'
  let desc = false
  let mode = ['ocean', 'truck']
  let params = { page: 0, limit: 4}

  if(req.query.sort && req.query.direction) {
    orderBy = req.query.sort
    if (req.query.direction == 'asc') { desc = false } else { desc = true }
  }

  if (req.query.international_transportation_mode) {
    mode = Array(req.query.international_transportation_mode)
  }

  if (req.query.per) {
    params.limit = req.query.per;
  }
  
  if (req.query.page) {
    params.page = (req.query.page - 1) * params.limit;
  }



  let shipments = await sql`
  select 
   to_jsonb(sh.id) as id, 
   sh.name as name,
    json_agg(json_build_object(
      'quantity', sp.quantity,
      'id', sp.product_id,
      'sku', p.sku,
      'description', p.description,
      'active_shipment_count', sp.shipment_count
  )) as products
  from (
    select DISTINCT ON (
      id, international_departure_date, international_transportation_mode) *
    from shipments
    GROUP BY id, name
        ) sh
inner join (
  select distinct on (
    shipment_id, 
    product_id,
    quantity ) row_number() over (partition by shipment_id) as shipment_count,  *
  from shipment_products
            ) sp
  on (sh.id = sp.shipment_id and sh.company_id = ${ req.query.company_id } and sh.international_transportation_mode in ${ sql(mode) })  
inner join (
  SELECT distinct ON (
    sku,
    description
    ) *
  from products
  ) p
  on (sp.product_id = p.id)
  group by sh.id, sh.name, international_departure_date
  order by ${ sql(orderBy) } ${ desc ? sql`desc` : sql`asc` }
  limit ${params.limit}
  offset ${params.page}
  `;


  res.status(200).json({shipments});

});

module.exports = router;
