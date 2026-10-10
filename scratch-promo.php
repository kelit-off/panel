<?php
use Pterodactyl\Models\{PromoCode,Product,User};
use Pterodactyl\Services\PromoCodes\PromoCodeService;
$svc = app(PromoCodeService::class);
$product = Product::first(); $user = User::first();
if (!$product) { echo "no product\n"; return; }
$p = PromoCode::create(['code'=>'TESTPROMO','percent_off'=>20,'duration'=>'once']);
try {
    $v = $svc->validate(' testpromo ', $user, $product);
    echo "valid, price {$product->price} -> ".$svc->discountedPrice($v,$product)."\n";
    $p->update(['is_active'=>false]);
    try { $svc->validate('TESTPROMO',$user,$product); } catch (\Exception $e) { echo "inactive: ".$e->getMessage()."\n"; }
    try { $svc->validate('NOPE',$user,$product); } catch (\Exception $e) { echo "unknown: ".$e->getMessage()."\n"; }
} finally { $p->delete(); echo "cleaned: ".PromoCode::count()."\n"; }
