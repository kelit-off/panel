<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerDomain;
use Pterodactyl\Services\WebHosting\ServerDomainService;
use Pterodactyl\Transformers\Api\Client\ServerDomainTransformer;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\Domains\GetDomainsRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Domains\StoreDomainRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Domains\DeleteDomainRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Domains\VerifyDomainRequest;

class DomainController extends ClientApiController
{
    public function __construct(private ServerDomainService $service)
    {
        parent::__construct();
    }

    /**
     * Lists the website's domains along with the addresses they must point to.
     */
    public function index(GetDomainsRequest $request, Server $server): array
    {
        return $this->fractal->collection($server->domains()->orderBy('domain')->get())
            ->transformWith(ServerDomainTransformer::class)
            ->addMeta([
                'target_ips' => $this->service->nodeAddresses($server->node),
                'domain_limit' => config('webhosting.domain_limit'),
            ])
            ->toArray();
    }

    /**
     * @throws \Pterodactyl\Exceptions\DisplayException
     */
    public function store(StoreDomainRequest $request, Server $server): array
    {
        $domain = $this->service->create($server, $request->input('domain'));

        return $this->fractal->item($domain)
            ->transformWith(ServerDomainTransformer::class)
            ->toArray();
    }

    public function verify(VerifyDomainRequest $request, Server $server, ServerDomain $domain): array
    {
        return $this->fractal->item($this->service->verify($domain))
            ->transformWith(ServerDomainTransformer::class)
            ->toArray();
    }

    public function delete(DeleteDomainRequest $request, Server $server, ServerDomain $domain): Response
    {
        $domain->delete();

        return $this->returnNoContent();
    }
}
