import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
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

type Listing = {
    id: string;
    title: string;
    description: string;
    condition: string;
    price: number;
    image_path: string | null;
    meetup_location: string | null;
    category_id: string;
    category?: Category | null;
};

const CONDITION_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
];

type Props = {
    listing: Listing;
    categories: Category[];
};

export default function EditListing({ listing, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: listing.title,
        description: listing.description,
        category_id: listing.category_id,
        condition: listing.condition,
        price: String(listing.price),
        meetup_location: listing.meetup_location ?? '',
        image: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/listings/${listing.id}`, {
            forceFormData: true,
            method: 'put',
        });
    };

    const deleteListing = () => {
        if (window.confirm('Delete this listing?')) {
            router.delete(`/listings/${listing.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Edit product" />
            <div className="mx-auto w-full max-w-2xl px-0 sm:px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-4 -ml-1 flex min-h-[44px] touch-manipulation justify-start sm:min-h-8"
                    asChild
                >
                    <Link
                        href={dashboard()}
                        className="inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                </Button>
                <Heading
                    title="Edit product"
                    description="Update your listing"
                />
                <form
                    onSubmit={submit}
                    className="mt-6 space-y-6 [&_input]:min-h-[44px] [&_input]:touch-manipulation sm:[&_input]:min-h-0 [&_select]:min-h-[44px] [&_select]:touch-manipulation sm:[&_select]:min-h-0 [&_textarea]:min-h-[88px]"
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
                                    <SelectItem key={cat.id} value={cat.id}>
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
                        <p className="text-sm text-muted-foreground">
                            If you want to meet up for the sale, add the
                            location here.
                        </p>
                        <InputError message={errors.meetup_location} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">
                            Image (optional, leave empty to keep current)
                        </Label>
                        {listing.image_path && (
                            <p className="text-sm text-muted-foreground">
                                Current:{' '}
                                <img
                                    src={listing.image_path}
                                    alt=""
                                    className="mt-1 h-20 w-20 rounded object-cover"
                                />
                            </p>
                        )}
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData('image', e.target.files?.[0] ?? null)
                            }
                        />
                        <InputError message={errors.image} />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                        >
                            {processing ? 'Saving…' : 'Save changes'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                            asChild
                        >
                            <Link href={dashboard()}>Cancel</Link>
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                            onClick={deleteListing}
                        >
                            Delete listing
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
