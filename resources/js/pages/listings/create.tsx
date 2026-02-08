import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type Category = {
    id: string;
    name: string;
    slug: string;
};

const CONDITION_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
];

type Props = {
    categories: Category[];
    listingCount: number;
    maxListingSlots: number;
    canCreate: boolean;
    slotPriceLabel: string;
};

export default function CreateListing({
    categories,
    listingCount,
    maxListingSlots,
    canCreate,
    slotPriceLabel,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category_id: '',
        condition: 'good',
        price: '',
        meetup_location: '',
        image: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/listings', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Add product" />
            <div className="mx-auto w-full max-w-2xl px-0 sm:px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-1 mb-4 flex min-h-[44px] justify-start touch-manipulation sm:min-h-8"
                    asChild
                >
                    <Link href={dashboard()} className="inline-flex items-center gap-2">
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                </Button>
                <Heading
                    title="Add product"
                    description="Create a new product listing"
                />
                <p className="mt-2 text-muted-foreground text-sm">
                    Your listings: {listingCount} / {maxListingSlots}
                </p>
                {!canCreate && (
                    <Alert className="mt-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-500/30">
                        <AlertDescription>
                            You&apos;ve reached your listing limit. Purchase more slots to list more items.
                            <Link
                                href="/upgrades"
                                className="ml-1 font-medium text-amber-700 underline dark:text-amber-400"
                            >
                                Buy slots ({slotPriceLabel})
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}
                <form
                    onSubmit={submit}
                    className="mt-6 space-y-6 [&_input]:min-h-[44px] [&_input]:touch-manipulation [&_select]:min-h-[44px] [&_select]:touch-manipulation [&_textarea]:min-h-[88px] sm:[&_input]:min-h-0 sm:[&_select]:min-h-0"
                >
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Product title"
                            className="w-full"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            rows={4}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Describe your product"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={data.category_id}
                            onValueChange={(value) =>
                                setData('category_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={cat.id}
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select
                            value={data.condition}
                            onValueChange={(value) =>
                                setData('condition', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CONDITION_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.condition} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            placeholder="0.00"
                        />
                        <InputError message={errors.price} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meetup_location">
                            Meetup location (optional)
                        </Label>
                        <Input
                            id="meetup_location"
                            value={data.meetup_location}
                            onChange={(e) =>
                                setData('meetup_location', e.target.value)
                            }
                            placeholder="e.g. Commonwealth View (Blks 89-91 Tanglin Halt Road)"
                        />
                        <p className="text-muted-foreground text-sm">
                            If you want to meet up for the sale, add the location here.
                        </p>
                        <InputError message={errors.meetup_location} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Image (optional)</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData(
                                    'image',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        <InputError message={errors.image} />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            type="submit"
                            disabled={processing || !canCreate}
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                        >
                            {processing ? 'Creating…' : 'Create listing'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                            asChild
                        >
                            <Link href={dashboard()}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
