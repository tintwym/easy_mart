import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/easymart-logo.png"
            alt="EasyMart"
            {...props}
            className={cn('object-contain', className)}
        />
    );
}
