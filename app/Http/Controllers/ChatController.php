<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $conversations = $this->getConversationsForUser($request->user()->id);

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
        ]);
    }

    protected function getConversationsForUser(string $userId)
    {
        return Conversation::with(['listing:id,title,image_path,price,user_id', 'buyer:id,name', 'listing.user:id,name,region'])
            ->where(function ($q) use ($userId) {
                $q->where('buyer_id', $userId)
                    ->orWhereHas('listing', fn ($lq) => $lq->where('user_id', $userId));
            })
            ->withCount('messages')
            ->with(['messages' => fn ($q) => $q->latest()->limit(1)])
            ->latest('updated_at')
            ->get();
    }

    public function show(Conversation $conversation, Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $participants = [$conversation->buyer_id, $conversation->listing->user_id];
        if (! in_array($user->id, $participants)) {
            abort(403);
        }

        $conversation->load(['listing:id,title,image_path,price', 'buyer:id,name', 'listing.user:id,name,region']);
        $messages = $conversation->messages()->with('user:id,name')->oldest()->get();
        $conversations = $this->getConversationsForUser($user->id);

        return Inertia::render('chat/show', [
            'conversations' => $conversations,
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request, Listing $listing): RedirectResponse
    {
        $buyerId = $request->user()->id;
        if ($listing->user_id === $buyerId) {
            return back()->with('error', 'You cannot chat with yourself.');
        }

        $conversation = Conversation::firstOrCreate(
            [
                'listing_id' => $listing->id,
                'buyer_id' => $buyerId,
            ],
            ['listing_id' => $listing->id, 'buyer_id' => $buyerId]
        );

        return redirect()->route('chat.show', $conversation);
    }

    public function sendMessage(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        $participants = [$conversation->buyer_id, $conversation->listing->user_id];
        if (! in_array($user->id, $participants)) {
            abort(403);
        }

        $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $conversation->messages()->create([
            'user_id' => $user->id,
            'body' => $request->body,
        ]);

        $conversation->touch();

        return back();
    }
}
