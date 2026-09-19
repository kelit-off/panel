<?php

namespace Pterodactyl\Http\Controllers\Auth;

use Ramsey\Uuid\Uuid;
use Illuminate\Http\Request;
use Pterodactyl\Models\User;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Rules\Username;
use Illuminate\Support\Facades\Hash;

class RegisterController extends AbstractLoginController
{
    /**
     * Creates a new customer account and logs them in immediately, so a
     * visitor can register and continue straight to checkout without an
     * extra login step.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'between:1,191', 'unique:users,username', new Username()],
            'email' => ['required', 'email', 'between:1,191', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // uuid isn't mass-assignable through the model's normal $fillable list,
        // so it must be force-filled here, same as UserCreationService does.
        $user = new User();
        $user->forceFill([
            'uuid' => Uuid::uuid4()->toString(),
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ])->save();

        // Model::getValidator() memoizes its validator per-instance using the
        // create-mode rules (no "ignore self" on unique checks) the first time
        // it runs. Logging in immediately triggers a second save() to persist
        // the remember token on this same object, which would reuse that stale
        // validator and fail uniqueness against the row we just inserted. A
        // freshly loaded instance builds its validator fresh, so it correctly
        // switches to update-mode rules instead.
        return $this->sendLoginResponse($user->fresh(), $request);
    }
}
