import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  Skeleton,
} from '../components/ui';

describe('Button component', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('renders correct variant classes', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('destructive');

    rerender(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole('button').className).toContain('outline');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Test</Button>);
    await user.click(screen.getByRole('button'));
    expect(clicked).toBe(true);
  });
});

describe('Input component', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter email" type="email" />);
    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('accepts aria-invalid attribute', () => {
    render(<Input aria-invalid="true" aria-describedby="error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

describe('Label component', () => {
  it('renders with htmlFor', () => {
    render(
      <>
        <Label htmlFor="test-input">Email</Label>
        <input id="test-input" />
      </>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    const label = screen.getByText('Email').closest('label');
    expect(label).toHaveAttribute('for', 'test-input');
  });
});

describe('Card components', () => {
  it('renders Card with header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Card body text</CardContent>
      </Card>,
    );
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card body text')).toBeInTheDocument();
  });
});

describe('Badge component', () => {
  it('renders with default variant', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Completed</Badge>);
    const badge = screen.getByText('Completed');
    expect(badge.className).toContain('green');
  });
});

describe('Progress component', () => {
  it('renders with correct aria attributes', () => {
    render(<Progress value={75} max={100} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', 'Progress');
  });

  it('clamps value between 0 and max', () => {
    render(<Progress value={150} max={100} label="Clamped" />);
    // The visual width should be clamped at 100%
    const bar = screen.getByRole('progressbar').querySelector('div');
    expect(bar?.style.width).toBe('100%');
  });
});

describe('Alert component', () => {
  it('renders with role=alert', () => {
    render(
      <Alert variant="destructive">
        <AlertDescription>Error message here</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error message here')).toBeInTheDocument();
  });
});

describe('Skeleton component', () => {
  it('renders with aria-hidden', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton.className).toContain('animate-pulse');
  });
});
