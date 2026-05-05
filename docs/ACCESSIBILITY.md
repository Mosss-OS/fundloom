# Accessibility

Last updated: April 2026

## Our Commitment

Fundloom is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.

## Conformance Status

The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.

Fundloom aims to conform to WCAG 2.1 Level AA.

## Accessibility Features

### Keyboard Navigation
All interactive elements can be accessed and operated using a keyboard alone:
- Tab navigation through all controls
- Visible focus indicators
- Logical tab order
- Skip to main content link
- Escape key closes modals and dropdowns

### Screen Reader Support
We strive to ensure compatibility with popular screen readers:
- Proper semantic HTML structure
- Meaningful ARIA labels and roles
- Live regions for dynamic content updates
- Descriptive alt text for meaningful images
- Logical heading structure (h1-h6)

### Color and Contrast
- Sufficient color contrast between text and background (minimum 4.5:1 for normal text)
- Color is not used as the sole means of conveying information
- Focus indicators are visible and have sufficient contrast
- Error and success states use both color and icons/text

### Text and Typography
- Resizable text up to 200% without loss of content or functionality
- Legible font sizes (minimum 16px for body text)
- Adequate line spacing (minimum 1.5)
- Proper use of whitespace to reduce visual crowding
- Left-aligned text for languages that are read left-to-right

### Forms and Inputs
- Clearly associated labels for all form inputs
- Clear error messages with instructions for correction
- Logical grouping of related fields
- Required field indicators
- Input masking where appropriate (phone numbers, etc.)
- Auto-focus on first error when form validation fails

### Multimedia
- Captions provided for video content
- Transcripts available for audio content
- Audio descriptions for video content when necessary
- Ability to pause, stop, or hide moving content

### Touch Targets
- Minimum touch target size of 48x48dp
- Adequate spacing between touch targets
- Consideration for users with motor impairments

## Testing and Evaluation

We use a combination of automated and manual testing to evaluate accessibility:

### Automated Testing
- axe-core for automated accessibility testing
- Lighthouse accessibility audits
- ESLint plugin for JSX accessibility (jsx-a11y)

### Manual Testing
- Keyboard-only navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast analysis
- Zoom and resize testing
- User testing with people with disabilities

## Known Limitations

While we strive for full accessibility, there may be some limitations:

1. **Third-party components**: Some third-party libraries or widgets may not be fully accessible
2. **Legacy code**: Older components may not meet current accessibility standards
3. **Complex visualizations**: Data visualizations and charts may have accessibility limitations
4. **Browser inconsistencies**: Variations in accessibility support across different browsers and assistive technologies

We are actively working to address these limitations.

## Feedback and Support

We welcome your feedback on the accessibility of Fundloom. Please let us know if you encounter accessibility barriers:

**Email**: accessibility@fundloom.io

Please include:
- The URL or page where you encountered the issue
- A description of the problem
- The assistive technology you were using (if applicable)
- Any suggestions for improvement

We aim to respond to accessibility feedback within 5 business days.

## Compliance with Laws and Regulations

We aim to comply with applicable accessibility laws and regulations, including:
- Americans with Disabilities Act (ADA)
- European Accessibility Act (EAA)
- Accessibility for Ontarians with Disabilities Act (AODA)
- Section 508 of the Rehabilitation Act

## Continuous Improvement

Accessibility is an ongoing process. We are committed to:
- Regular accessibility audits and assessments
- Incorporating accessibility into our design and development process
- Providing accessibility training for our team
- Staying current with accessibility best practices and standards
- Listening to and acting on feedback from users with disabilities

## Resources

For more information about web accessibility, we recommend:
- Web Content Accessibility Guidelines (WCAG) 2.1: https://www.w3.org/TR/WCAG21/
- WebAIM: https://webaim.org/
- The A11Y Project: https://a11yproject.com/
- MDN Web Docs on Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility

## Policy Updates

We may update this Accessibility Statement from time to time. We will notify you of any changes by posting the updated statement on this page.