// utils/groupByProduct.js
export function groupVariationsByProduct(variations) {
    const map = {};
  
    variations.forEach((v) => {
      const p = v.product;
      if (!map[p.id]) {
        // initialize a “product” object
        map[p.id] = {
          id: p.id,
          item_name: p.item_name,
          item_name_amh: p.item_name_amh,
          image: p.image,
          // you won’t have these fields from the variation endpoint,
          // so either default them or fetch them another way:
          image_full: null,
          image_left: null,
          image_right: null,
          image_back: null,
          // if you need category, you’ll have to add it into your
          // ProductVariantSerializer or fetch separately
          category: null,
          variations: [],
        };
      }
      // push this variation onto its product’s list
      map[p.id].variations.push(v);
    });
  
    // return an array of products
    return Object.values(map);
  }
  