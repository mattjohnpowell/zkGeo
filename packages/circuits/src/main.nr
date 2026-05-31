// Prototype only. This is not production location proof verification.
//
// The first circuit proves that private integer microdegree coordinate
// magnitudes are inside valid latitude and longitude ranges.

fn main(lat_abs_e6: u32, lng_abs_e6: u32) {
    let max_lat: u32 = 90_000_000;
    let max_lng: u32 = 180_000_000;

    assert(lat_abs_e6 <= max_lat);
    assert(lng_abs_e6 <= max_lng);
}
